/* 
 * Kuda includes a library and editor for authoring interactive 3D content for the web.
 * Copyright (C) 2011 SRI International.
 *
 * This program is free software; you can redistribute it and/or modify it under the terms
 * of the GNU General Public License as published by the Free Software Foundation; either 
 * version 2 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program; 
 * if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
 * Boston, MA 02110-1301 USA.
 */

var hext = (function(hext) {
	hext.tools = hext.tools || {};
	
	/**
	 * Enum for the different ManometerTube types.
	 * <ul><pre>
	 * <li>hext.tools.TubeType.Pressure
	 * <li>hext.tools.TubeType.PressureYellow
	 * <li>hext.tools.TubeType.Cfm
	 * </ul></pre>
	 */
	hext.tools.TubeType =  {
		Pressure: 'Pressure',
		PressureYellow: 'PressureYellow',
		Cfm: 'CFM'
	};

	/**
	 * @class A ManometerTube is the data model representation of a tube that a
	 * manometer uses as input.
	 * @extends hext.tools.BaseTool
	 * 
	 * @parameter {hext.tools.InputId} inputId the input id
	 * @parameter {hext.tools.TubeType} tubeType the type of ManometerTube
	 */
	var ManometerTube = function(inputId, tubeType) {
		hext.tools.BaseTool.call(this);
		
		/**
		 * The id of the Manometer input the ManometerTube connects to.
		 * @type hext.tools.InputId
		 */
		this.inputId = inputId;
		
		/**
		 * The type of data the ManometerTube is receiving.
		 * @type hext.tools.TubeType
		 */
		this.tubeType = tubeType;
		
		/**
		 * The Manometer the ManometerTube is connected to.
		 * @type hext.tools.Manometer
		 */
		this.manometer = null;
		
		this.location = null;
		this.value = 0;
		this.msgHandler = null;
	};

	ManometerTube.prototype = new hext.tools.BaseTool();
	ManometerTube.prototype.constructor = ManometerTube;
		
	/**
	 * Send a cleanup Message and remove all references in the
	 * ManometerTube.
	 */
	ManometerTube.prototype.cleanup = function() {
		hext.tools.BaseTool.prototype.cleanup.call(this);
		this.manometer = null;
		this.location = null;
	};
		
	/*
	 * Not currently supported.
	 */
	ManometerTube.prototype.toOctane = function() {
		
	};
		
	/**
	 * Get the pressure value for the ManometerTube in its current
	 * Location.
	 * 
	 * @return {number} the current pressure value
	 */
	ManometerTube.prototype.getValue = function() {
		return this.value;
	};
		
	/**
	 * Set the pressure value for the ManometerTube in its current Location
	 * and notify its Manometer.
	 * 
	 * @return {number} the pressure value to set
	 */
	ManometerTube.prototype.setValue = function(value) {
		if (Math.abs(this.value - value) > 0.05) {
			this.value = value;
			this.manometer.inputUpdated(this.inputId);
		}
	};
		
	/**
	 * Get the ManometerTube's current Location.
	 * 
	 * @return {hext.engines.Location} the current Location
	 */
	ManometerTube.prototype.getLocation = function() {
		return this.location;
	};
		
	/**
	 * Set the ManometerTube's current Location and register it to handle
	 * update Messages from the Location.
	 * 
	 * @param {hext.engines.Location} location the Location to set
	 */
	ManometerTube.prototype.setLocation = function(location) {
		var type = hext.msg.pressure,
			params;
		
		if (this.tubeType == hext.tools.TubeType.Cfm) {
			params = [hemi.dispatch.MSG_ARG + 'data.airFlow'];
		} else {
			params = [hemi.dispatch.MSG_ARG + 'data.pressure'];
		}
		
		if (this.location != null) {
			this.location.unsubscribe(this.msgHandler, type);
			this.msgHandler = null;
		}
		
		this.location = location;
		this.msgHandler = this.location.subscribe(
			type,
			this,
			'setValue',
			params);
	};

	hemi.makeCitizen(ManometerTube, 'hext.tools.ManometerTube', {
		msgs: [],
		toOctane: []
	});
	
	/**
	 * @class A ManometerTubeManager manages and provides lookup service for
	 * ManometerTubes.
	 * @extends hemi.world.Citizen
	 */
	var ManometerTubeManager = function() {	
		this.tubes = [];
	};
		
	/**
	 * Send a cleanup Message and remove all references in the
	 * ManometerTubeManager.
	 */
	ManometerTubeManager.prototype.cleanup = function() {
		this.tubes = [];
	};
		
	/*
	 * Not currently supported.
	 */
	ManometerTubeManager.prototype.toOctane = function() {
		
	};
		
	/**
	 * Get the ManometerTube that connects the specified Manometer input to
	 * the given Location.
	 * 
	 * @param {hext.tools.InputId} inputId  id of the input the
	 *     ManometerTube connects to
	 * @param {hext.engines.Location} location the Location the
	 *     ManometerTube connects to
	 * @return {hext.tools.ManometerTube} the found ManometerTube or null
	 */
	ManometerTubeManager.prototype.getTube = function(inputId, location) {
		var tube = null;
		
		for (var ndx = 0, length = this.tubes.length; ndx < length; ndx++) {
			var aTube = this.tubes[ndx];
			
			if (aTube.inputId == inputId && aTube.getLocation() == location) {
				tube = aTube;
				break;
			}
		}
		
		return tube;
	};
		
	/**
	 * Add the given ManometerTube to the ManometerTubeManager.
	 * 
	 * @param {hext.tools.ManometerTube} tube the ManometerTube to add
	 */
	ManometerTubeManager.prototype.addTube = function(tube) {
		var ndx = this.tubes.indexOf(tube);
		
		if (ndx == -1) {
			this.tubes.push(tube);
		}
	};
		
	/**
	 * Remove the given ManometerTube from the ManometerTubeManager.
	 * 
	 * @param {hext.tools.ManometerTube} tube the ManometerTube to remove
	 * @return {hext.tools.ManometerTube} the removed ManometerTube or null
	 */
	ManometerTubeManager.prototype.removeTube = function(tube){
		var found = null;
		var ndx = this.tubes.indexOf(tube);
		
		if (ndx != -1) {
			var spliced = this.tubes.splice(ndx, 1);
			
			if (spliced.length == 1) {
				found = spliced[0];
			}
		}
		
		return found;
	};

	hemi.makeCitizen(ManometerTubeManager, 'hext.tools.ManometerTubeManager', {
		msgs: [],
		toOctane: []
	});
	
	return hext;
})(hext || {});
