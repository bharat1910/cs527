/* jshint undef: true, unused: true */
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
	
	// Constants for the manometer view htm file
	var DOT_ID = 'manometerDot';
	var UPPER_LEFT_INPUT = 'ul';
	var LOWER_LEFT_INPUT = 'll';
	var UPPER_RIGHT_INPUT = 'ur';
	var LOWER_RIGHT_INPUT = 'lr';

	/**
	 * @class A ManometerController handles interactions between the Manometer
	 * and its views.
	 * @extends hext.tools.BaseController
	 */
	ManometerController = function(client) {
		hext.tools.BaseController.call(this);

		this.client = client;
		
		/**
		 * The manager used to look up Locations by picked shape names.
		 * @type hext.engines.PressureEngine
		 */
		this.locationManager = null;
		
		/**
		 * The manager used to look up ManometerTubes by Location and InputId.
		 * @type hext.tools.ManometerTubeManager
		 */
		this.tubeManager = null;
		
		/**
		 * The id of the currently selected input tap.
		 * @type string
		 */
		this.activeInputId = null;
		
		/**
		 * The id of the HTML element for the currently selected input tap.
		 * @type string
		 */
		this.activeWidgetId = null;
	};

	ManometerController.prototype = new hext.tools.BaseController();
	ManometerController.prototype.constructor = ManometerController;
		
	/**
	 * Send a cleanup Message and remove all references in the
	 * ManometerController.
	 */
	ManometerController.prototype.cleanup = function() {
		hext.tools.BaseController.prototype.cleanup.call(this);
		this.locationManager = null;
		this.tubeManager = null;
	};
		
	/*
	 * Not currently supported.
	 */
	ManometerController.prototype.toOctane = function() {
		
	};
		
	/**
	 * Check the shape from the pick to see if there is an associated
	 * Location. If so, try to get a ManometerTube for that Location and
	 * the currently selected input tap and connect it to the Manometer.
	 * Clean up the ManometerController so it stops intercepting pick
	 * Messages.
	 * 
	 * @param {PickInfo} pickInfo pick event information
	 */
	ManometerController.prototype.onPick = function(pickInfo) {
		var tube = null;
		
		if (this.activeInputId != null) {
			var shapeName = pickInfo.pickedMesh.name;
			var location = this.locationManager.getLocationByShapeName(shapeName);
			
			if (location != null) {
				tube = this.tubeManager.getTube(this.activeInputId, location);
			}
		}
					
		if (tube != null) {
			this.model.setInput(tube);
			
			switch (tube.tubeType) {
				case hext.tools.TubeType.Pressure:
					this.view.setTapToDoor(this.activeWidgetId, true);
					break;
				case hext.tools.TubeType.PressureYellow:			
					this.view.setTapToBlower(this.activeWidgetId, false);
					this.view.setTapToRoom(this.activeWidgetId, true);
					break;
				case hext.tools.TubeType.Cfm:
					this.view.setTapToRoom(this.activeWidgetId, false);
					this.view.setTapToBlower(this.activeWidgetId, true);
					break;
			}
		}

		this.view.setTapSelected(this.activeWidgetId, false);
		document.getElementById('kuda').style.cursor = 'default';
		this.client.picker.removePickGrabber();
		this.activeInputId = null;
		this.activeWidgetId = null;
	};

	/**
	 * Connect the Manometer data model to the manometer display HTML view
	 * so that they respond to each other.
	 * @see hext.tools.BaseController#setupView
	 */
	ManometerController.prototype.setupView = function() {
		hext.tools.BaseController.prototype.setupView.call(this);
		
		this.model.subscribe(hext.msg.pressure,
			this.view,
			'updateValues',
			[hemi.dispatch.MSG_ARG + 'data.left',
			 hemi.dispatch.MSG_ARG + 'data.right']);
		
		this.model.subscribe(hext.msg.input,
			this.view,
			'updateModes',
			[hemi.dispatch.MSG_ARG + 'data.left',
			 hemi.dispatch.MSG_ARG + 'data.right']);
		
		// Go ahead and set the initial modes manually.
		this.view.updateModes(this.model.leftMode, this.model.rightMode);
		
		var that = this;
		var toolView = this.view;
		var toolModel = this.model;
		
		this.view.addLoadCallback(function(){
			toolView.container.bind('click', function(event){
				var targetId = event.target.id;
				var newWidget = null;
				var newId = null;
				
				if (targetId == DOT_ID) {
					// Get the id of the containing element
					targetId = event.target.parentNode.parentNode.id;
				}
				
				switch (targetId) {
					case UPPER_LEFT_INPUT:
						newWidget = targetId;
						newId = hext.tools.InputId.UpperLeft;
						break;
					case UPPER_RIGHT_INPUT:
						newWidget = targetId;
						newId = hext.tools.InputId.UpperRight;
						break;
					case LOWER_LEFT_INPUT:
						newWidget = targetId;
						newId = hext.tools.InputId.LowerLeft;
						break;
					case LOWER_RIGHT_INPUT:
						newWidget = targetId;
						newId = hext.tools.InputId.LowerRight;
						break;
				}
				
				if (newWidget == null) {
					// The user clicked somewhere else. Just cancel the
					// previous tap selection.
					toolView.setTapSelected(that.activeWidgetId, false);
					that.client.picker.removePickGrabber();
				}
				else {
					// The user selected a tap. Set its CSS class and set
					// the ManometerController to intercept pick Messages.
					that.activeWidgetId = newWidget;
					that.activeInputId = newId;
					toolModel.removeInput(newId);
					toolView.setTapToDoor(newWidget, false);
					toolView.setTapToBlower(newWidget, false);
					toolView.setTapToRoom(newWidget, false);
					toolView.setTapSelected(newWidget, true);
					document.getElementById('kuda').style.cursor = 'pointer';
					that.client.picker.setPickGrabber(that);
				}
			});
		});
	};

	hemi.makeCitizen(ManometerController, 'hext.tools.ManometerController', {
		msgs: [],
		toOctane: []
	});

	return hext;
})(hext || {});
