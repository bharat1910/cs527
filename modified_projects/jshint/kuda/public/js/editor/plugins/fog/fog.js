/* jshint undef: false, unused: false, asi: true */
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

(function() {
	"use strict";
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
////////////////////////////////////////////////////////////////////////////////////////////////////

	var shorthand = editor.tools.fog;

	shorthand.init = function() {
		var navPane = editor.ui.getNavPane('Environment'),
			
			fogMdl = new FogModel(),
			fogView = new FogView(),
			fogCtr = new FogController();
		
		fogCtr.setModel(fogMdl);
		fogCtr.setView(fogView);

		navPane.add(fogView);
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Tool Definition
////////////////////////////////////////////////////////////////////////////////////////////////////
    
	shorthand.events = {
		// fog form sb widget events
		FogOnOff: "fog.FogOnOff",
		SaveFog: "fog.SaveFog",
		
		// model events
		FogVisible: "fog.FogVisible",
		FogWorldLoaded: "fog.FogWorldLoaded"
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Model
////////////////////////////////////////////////////////////////////////////////////////////////////

	var FogModel = function() {
		editor.ToolModel.call(this, 'fog');
	};
		
	FogModel.prototype = new editor.ToolModel();
	FogModel.prototype.constructor = FogModel;
		
	FogModel.prototype.setVisible = function(visible) {
		if (visible && this.currentVals) {
			hemi.fx.setFog(editor.client, this.currentVals.color, this.currentVals.start, 
				this.currentVals.end);
		}
		else {
			hemi.fx.clearFog(editor.client);
		}
		
		this.notifyListeners(shorthand.events.FogVisible, visible);
	};
	
	FogModel.prototype.save = function(params) {
		this.currentVals = params;
		this.setVisible(true);
	};
		
	FogModel.prototype.worldCleaned = function() {
		this.currentVals = null;
		this.setVisible(false);
		this.notifyListeners(shorthand.events.FogWorldLoaded, null);
    };
    
    FogModel.prototype.worldLoaded = function() {
		var fog = hemi.world.fog;
		
		this.currentVals = fog;
		this.notifyListeners(shorthand.events.FogWorldLoaded, fog);
    };
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Fog Form Sidebar Widget
////////////////////////////////////////////////////////////////////////////////////////////////////
	var FogFormWidget = function(options) {
		var newOpts = jQuery.extend({
				name: 'fogFormWidget',
				uiFile: 'js/editor/plugins/fog/html/fogForms.htm',
				height: editor.ui.Height.FULL
			}, options);
	    editor.ui.FormWidget.call(this, newOpts);
	};
	var formWgtSuper = editor.ui.FormWidget.prototype;
		
	FogFormWidget.prototype = new editor.ui.FormWidget();
	FogFormWidget.prototype.constructor = FogFormWidget;
		
	FogFormWidget.prototype.layout = function() {
		formWgtSuper.layout.call(this);
		
		var wgt = this,
			form = this.find('form'),
			validator = editor.ui.createDefaultValidator();
		
		this.onOff = this.find('#fogFormOnOff');
		this.saveBtn = this.find('#fogFormSaveBtn');
		this.cancelBtn = this.find('#fogFormCancelBtn');
		this.start = new editor.ui.Input({
			container: wgt.find('#fogFormStart'),
			validator: validator
		});
		this.end = new editor.ui.Input({
			container: wgt.find('#fogFormEnd'),
			validator: validator
		});
		
		this.colorPicker = new editor.ui.ColorPicker({
			inputId: 'fogFormColor',	
			buttonId: 'fogFormColorPicker'			
		});
		
		this.find('#fogFormColorLbl').after(this.colorPicker.getUI());
		
		this.colorPicker.addListener(editor.events.ColorPicked, function(clr) {
			wgt.canSave();
		});
		
		this.onOff.bind('change', function(evt) {
			var elem = jQuery(this),
				checked = elem.is(':checked');
			
			wgt.notifyListeners(shorthand.events.FogOnOff, checked);
		});
		
		form.find('input:not(type["checkbox"])').bind('keydown', function(evt) {
			wgt.canSave();
		});
		
		this.saveBtn.bind('click', function(evt) {
			var vals = {
				color: wgt.colorPicker.getColorHex(),
				start: wgt.start.getValue(),
				end: wgt.end.getValue()
			};
			
			wgt.notifyListeners(shorthand.events.SaveFog, vals);
			
			wgt.saveBtn.attr('disabled', 'disabled');
			wgt.cancelBtn.attr('disabled', 'disabled');
		});
		
		this.cancelBtn.bind('click', function(evt) {
			wgt.saveBtn.attr('disabled', 'disabled');
			wgt.notifyListeners(editor.events.Cancel, null);
			wgt.find('input.error').removeClass('error');
		});
		
		form.bind('submit', function(evt) {
			return false;
		});
	};
	
	FogFormWidget.prototype.set = function(vals) {
		if (vals === null || vals === undefined) {
			this.colorPicker.reset();
			this.start.reset();
			this.end.reset();
			this.onOff.attr('checked', false);
		} else {
			this.colorPicker.setColor(vals.color);
			this.start.setValue(vals.start);
			this.end.setValue(vals.end);
			this.onOff.attr('checked', true);
		}
		
		this.saveBtn.attr('disabled', 'disabled');
		this.cancelBtn.attr('disabled', 'disabled');
	};
	
	FogFormWidget.prototype.canSave = function() {
		if (this.start.getValue() != null && this.end.getValue() != null &&
			this.colorPicker.getColor() !== null) {
				this.saveBtn.removeAttr('disabled');
				this.cancelBtn.removeAttr('disabled');
		} else {
			this.saveBtn.attr('disabled', 'disabled');
			this.cancelBtn.attr('disabled', 'disabled');
		}
	};
    
////////////////////////////////////////////////////////////////////////////////////////////////////
// View
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var FogView = function() {
		editor.ToolView.call(this, {
			toolName: 'Fog',
			toolTip: 'Create and edit fog',
			id: 'fog'
		});
		
		this.addPanel(new editor.ui.Panel({
			classes: ['fogSidePanel']
		}));
		
		this.sidePanel.addWidget(new FogFormWidget());
	};
		
	FogView.prototype = new editor.ToolView();
	FogView.prototype.constructor = FogView;
    
////////////////////////////////////////////////////////////////////////////////////////////////////
//  Controller
////////////////////////////////////////////////////////////////////////////////////////////////////

    var FogController = function() {
		editor.ToolController.call(this);
	};
	var fogCtrSuper = editor.ToolController.prototype;
		
	FogController.prototype = new editor.ToolController();
	FogController.prototype.constructor = FogController;
		
	    /**
	     * Binds event and message handlers to the view and model this object 
	     * references.  
	     */
    FogController.prototype.bindEvents = function() {
		fogCtrSuper.bindEvents.call(this);
        
        var model = this.model,
        	view = this.view,
			fogWgt = view.sidePanel.fogFormWidget;
		
		// fog sb widget specific
		fogWgt.addListener(shorthand.events.FogOnOff, function(turnOn) {
			model.setVisible(turnOn);
		});
		fogWgt.addListener(shorthand.events.SaveFog, function(params) {
			model.save(params);
		});
		fogWgt.addListener(editor.events.Cancel, function() {
			var curVals = model.currentVals;
			
			if (curVals) {
				fogWgt.set(curVals);
			} else {
				fogWgt.set(null);
			}
		});
		
		// model specific
		model.addListener(shorthand.events.FogVisible, function(visible) {
			fogWgt.onOff.attr('checked', visible);
		});
		model.addListener(shorthand.events.FogWorldLoaded, function(params) {
			if (fogWgt.colorPicker != null) {
				fogWgt.set(params);
			}
		});
    };
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Extra Scripts
////////////////////////////////////////////////////////////////////////////////////////////////////

	editor.getCss('js/editor/plugins/fog/css/style.css');
	
})();
