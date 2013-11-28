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
	
	editor.ui = editor.ui || {};	
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	editor.ui.Layer = {
		TOOL: 500,
		TOOLBAR: 600,
		DIALOG: 700,
		MENU: 800
	};
	
	editor.ui.Location = {
		TOP: 0,
		RIGHT: 1,
		BOTTOM: 2
	};
	
	editor.ui.Height = {
		FULL: 0,
		HALF: 1,
		THIRD: 2,
		MANUAL: 3
	};
	
	var EXTENT = 50,		// Grid will reach 50 meters in each direction
		FIDELITY = 1,		// Grid squares = 1 square meter

		FARPLANE = 10000,
		NEARPLANE = 0.5;


////////////////////////////////////////////////////////////////////////////////////////////////////
// Panel
////////////////////////////////////////////////////////////////////////////////////////////////////

	var panels = [];
	
	var PanelBase = function(options) {
		var newOpts = jQuery.extend({
			location: editor.ui.Location.RIGHT,
			classes: [],
			minMax: true,
			startsVisible: true
		}, options);
		
		this.minMaxBtn = null;
		this.origOpacity = null;
		this.visible = true;
		
		this.name = newOpts.location === editor.ui.Location.TOP ?
			'topPanel' : newOpts.location === editor.ui.Location.BOTTOM ?
			'bottomPanel' : 'sidePanel';

		editor.ui.Component.call(this, newOpts);
		
		if (!options.extending) {
			panels.push(this);
		}
	};
		
	PanelBase.prototype = new editor.ui.Component();
	PanelBase.prototype.constructor = PanelBase;
	
	PanelBase.prototype.layout = function() {
		var minMaxBtn = this.minMaxBtn = jQuery('<button class="minMax" style="position:absolute;"></button>'),
			ctn = this.container = jQuery('<div></div>'),
			pnl = this;
		
		jQuery('body').append(ctn);
		
		if (this.config.minMax) {
			ctn.append(minMaxBtn);
		}
		
		// put this on the tool layer and align it correctly
		ctn.css({
			zIndex: editor.ui.Layer.TOOL
		})
		.bind('mouseenter', showMinMaxBtn)
		.bind('mouseleave', hideMinMaxBtn);
		
		minMaxBtn.bind('click', function(evt) {
			var min = minMaxBtn.data('min');
			
			if (min) {
				pnl.minimize();
			} else {
				pnl.maximize();
			}
			
			minMaxBtn.data('min', !min);
		}).data('origOpacity', 1).data('min', true).text('Min').hide();
		
		// add any specified classes
		for (var i = 0, il = this.config.classes.length; i < il; i++) {
			ctn.addClass(this.config.classes[i]);
		}
		
		switch(this.config.location) {
			case editor.ui.Location.RIGHT:
				ctn.addClass('rightAligned');
				break;
			case editor.ui.Location.TOP:
				ctn.addClass('topAligned');
				break;
			case editor.ui.Location.BOTTOM:
				ctn.addClass('bottomAligned');
				break;
		}
		
		
		this.origOpacity = ctn.css('opacity');
	};
	
	PanelBase.prototype.getName = function() {
		return this.name;
	};
	
	PanelBase.prototype.getPreferredHeight = function() {
		return this.preferredHeight;
	};
	
	PanelBase.prototype.isVisible = function() {
		return this.visible;
	};
	
	PanelBase.prototype.maximize = function() {
		var animData = {},
			minMaxBtn = this.minMaxBtn,
			that = this;
		
		addSlideAnim(this, 0, animData);
		this.container.bind('mouseleave', hideMinMaxBtn)
			.bind('mouseenter', showMinMaxBtn)
			.animate(animData, function() {
				minMaxBtn.text('Min');
			})
			.removeClass('minimized');
	};
	
	PanelBase.prototype.minimize = function() {
		var animData = {},
			minMaxBtn = this.minMaxBtn,
			that = this,
			dest;
		
		switch(this.config.location) {
			case editor.ui.Location.TOP:
			case editor.ui.Location.BOTTOM:
				dest = this.container.height();
				break;
			case editor.ui.Location.RIGHT:
			default:
				dest = this.container.width();
				break;
		}
		
		addSlideAnim(this, -1 * dest, animData);
		this.container.unbind('mouseleave', hideMinMaxBtn)
			.unbind('mouseenter', showMinMaxBtn)
			.animate(animData, function() {
				minMaxBtn.text('Max');
			})
			.addClass('minimized');
	};
	
	PanelBase.prototype.resize = function() {
		var ctnHeight = this.container.outerHeight(),
			ctnWidth = this.container.outerWidth(),
			btnHeight= this.minMaxBtn.outerHeight(),
			btnWidth = this.minMaxBtn.outerWidth(),
			windowWidth = window.innerWidth ? window.innerWidth 
				: document.documentElement.offsetWidth,
			midWidth = (windowWidth - ctnWidth)/2;
		
		switch(this.config.location) {
			case editor.ui.Location.RIGHT:
				this.minMaxBtn.css({
					top: (ctnHeight - btnHeight)/2,
					right: ctnWidth
				});
				break;
			case editor.ui.Location.TOP:
				this.container.css({
					left: midWidth
				});
				this.minMaxBtn.css({
					left: (ctnWidth - btnWidth)/2,
					top: ctnHeight
				});
				break;
			case editor.ui.Location.BOTTOM:
				this.container.css({
					left: midWidth
				});
				this.minMaxBtn.css({
					left: (ctnWidth - btnWidth)/2,
					bottom: ctnHeight
				});
				break;
			default:
				this.minMaxBtn.css({
					top: (ctnHeight - btnHeight)/2,
					left: ctnWidth
				});
				break;
		}
	};
	
	PanelBase.prototype.setVisible = function(visible, opt_skipAnim) {
		if (visible !== this.visible) {
			setVisible(this, visible, opt_skipAnim);
			
			if (!visible) {							
				this.container.bind('mouseleave', hideMinMaxBtn)
					.bind('mouseenter', showMinMaxBtn)
					.removeClass('minimized');
			}
			var pnl = this;
			this.resize();
			this.visible = visible;
			this.notifyListeners(editor.events.PanelVisible, {
				panel: pnl,
				visible: visible
			});
		}
	};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Panel Private Methods
////////////////////////////////////////////////////////////////////////////////////////////////////
		
	/*
     * Adds the opacity parameter for animation.
     * 
     * @param {boolean} visible flag indicating visibility
     * @param {number} origOpacity the original opacity of the target
     * @param {jQuery} target the target element
     * @param {object} animData animation object literal passed to jQuery 
     * 		animate() method
     */
	function addOpacityAnim(visible, origOpacity, target, animData) {
		var opacityStart = visible ? 0 : origOpacity,
			opacityEnd = visible ? origOpacity : 0;
		
		animData.opacity = opacityEnd;
		target.css('opacity', opacityStart);
		
		if (visible) {
			target.show();
		}
	}
	
	/*
     * Adds the location parameter for animation, which is used for sliding
     * the element.
     * 
     * @param {number} destination the x/y position to slide to
     * @param {object} animData animation object literal passed to jQuery 
     * 		animate() method
     */
	function addSlideAnim(panel, destination, animData) {
		var ctn = panel.container,
			location;
		
		switch(panel.config.location) {
			case editor.ui.Location.TOP:
				location = 'top';
				break;
			case editor.ui.Location.BOTTOM:
				location = 'bottom';
				break;
			case editor.ui.Location.RIGHT:
				location = 'right';
				break;
			default:
				location = 'left';
				break;
		}
		
		var start = parseInt(ctn.css(location), 10),
			animAmt = '+=' + (destination - start);
		
		animData[location] = animAmt;
	}
	
	/*
     * Sets the visibility of a panel, using animations if specified
     * 
     * @param {boolean} visible flag indicating the new visibility
     * @param {boolean} opt_skipAnim optional flag indicating whether to 
     * 		skip the animation 
     */
	function setVisible(panel, visible, opt_skipAnim) {
		var ctn = panel.container,
			btn = panel.minMaxBtn,
			animData = {},
			dest = visible ? 0 : -20,
			location;
		
		switch(panel.config.location) {
			case editor.ui.Location.TOP:
				location = 'top';
				break;
			case editor.ui.Location.BOTTOM:
				location = 'bottom';
				break;
			case editor.ui.Location.RIGHT:
				location = 'right';
				break;
			default:
				location = 'left';
				break;
		}
		
		if (visible) {
			if (!btn.data('min')) {
				// The container was minimized, we need to rebind handlers
				ctn.bind('mouseenter', showMinMaxBtn)
				.bind('mouseleave', hideMinMaxBtn);
			}
			
			btn.data('min', true).text('Min').hide();
		} else {
			// Check if it is already hidden
			var pos = parseInt(ctn.css(location), 10);
			opt_skipAnim = opt_skipAnim || pos < dest;
		}
		
		if (opt_skipAnim) {
			if (visible) {
				ctn.css(location, dest).css('opacity', panel.origOpacity).show();
				btn.css(location, dest);
			}
			else {
				ctn.css(location, dest).css('opacity', 0).hide();
				btn.css(location, dest);
			}
		} else {
			addOpacityAnim(visible, panel.origOpacity, ctn, animData, ctn);
			addSlideAnim(panel, dest, animData);
			
			ctn.animate(animData, function() {
				if (!visible) {
					ctn.hide();
				}
			});
		}
	}

	/*
     * Hides the min/max button of a panel
     * 
     * @param {Object} evt
     */
	function hideMinMaxBtn(evt) {
		var btn = jQuery(this).find('button.minMax'),
			animData = {};
		
		addOpacityAnim(false, btn.data('origOpacity'), btn, animData);
		btn.animate(animData, function() {
			btn.hide();
		});
	}
	
	function showMinMaxBtn(evt) {
		var btn = jQuery(this).find('button.minMax'),
			animData = {};
		
		addOpacityAnim(true, btn.data('origOpacity'), btn, animData);
		btn.animate(animData);
	}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Tab Bar
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var NavBar = function() {
		this.panes = new Hashtable();
		this.visiblePane = null;
		
		PanelBase.call(this, {
			location: 3		// LEFT
		});
	};
	var navBarSuper = PanelBase.prototype;
		
	NavBar.prototype = new PanelBase({ extending: true });
	NavBar.prototype.constructor = NavBar;
		
	NavBar.prototype.layout = function() {
		navBarSuper.layout.call(this);

		var title = jQuery('<h1><span>World</span><span class="editor">Editor</span></h1>');
		this.list = jQuery('<ul></ul>');
		this.container.attr('id', 'navBar').append(title).append(this.list);
		this.resize();
	};
	
	NavBar.prototype.add = function(navPane, opt_liId) {			
		var li = jQuery('<li></li>'),
			ui = navPane.getUI(),
			wgt = this;
		
		if (opt_liId != null) {
			li.attr('id', opt_liId);
		}
		li.append(ui);
		ui.find('a').bind('click', function(evt) {
			if (wgt.visiblePane && wgt.visiblePane !== navPane) {
				wgt.visiblePane.setVisible(false);
			}
			
			navPane.setVisible(!navPane.isVisible());
			
			if (navPane.isVisible()) {
				wgt.visiblePane = navPane;
			} else {
				wgt.visiblePane = null;
			}
		});
		
		this.list.append(li); 
		this.panes.put(navPane.title, {
			li: li,
			pane: navPane
		});
		
		navPane.addListener(editor.events.Enabled, function(data) {
			var obj = wgt.panes.get(data.item);
			
			if (data.enabled) {
				obj.li.show();
			}
			else {
				obj.pane.setVisible(false, function() {						
					obj.li.hide();
				});
			}
		});
	};
	
	NavBar.prototype.get = function(title) {
		var obj = this.panes.get(title);
		return obj != null ? obj.pane : obj;
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Tab Pane
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var NavPane = editor.ui.NavPane = function(title, options) {	
		this.toolbar = null;
		this.title = title;
		this.visible = false;
		
		editor.ui.Component.call(this, options);
	};
		
	NavPane.prototype = new editor.ui.Component();
	NavPane.prototype.constructor = editor.ui.NavPane;
		
	NavPane.prototype.layout = function() {
		this.toolbarContainer = jQuery('<div class="toolbarContainer"></div>');
		this.toolbarContainer.hide();
		this.container = jQuery('<div></div>');
		this.titleElem = jQuery('<h2><a href="#">' + this.title + '</a></h2>');
		
		this.container.append(this.titleElem)
		.append(this.toolbarContainer);
	};
	
	NavPane.prototype.add = function(toolView) {
		this.toolbar.add(toolView);
	};
	
	NavPane.prototype.isVisible = function() {
		return this.visible;
	};
	
	NavPane.prototype.notify = function(eventType, value) {
		if (eventType === editor.events.Enabled) {
			this.setEnabled(value.enabled); 
		}
	};
	
	NavPane.prototype.remove = function(toolView) {
		this.toolbar.remove(toolView);
	};
	
	NavPane.prototype.setEnabled = function(enabled) {
		this.notifyListeners(editor.events.Enabled, {
			item: this.title,
			enabled: enabled
		});
	};
	
	NavPane.prototype.setToolBar = function(toolbar) {
		this.toolbar = toolbar;
		var ui = toolbar.getUI();
		this.toolbarContainer.append(ui);
		
		this.toolbar.addListener(editor.events.Enabled, this);
	};
	
	NavPane.prototype.setVisible = function(visible, opt_callback) {
		if (visible) {
			this.toolbarContainer.slideDown(function() {
				if (opt_callback) {
					opt_callback();
				}
			});
			this.toolbar.loadState();
			this.container.addClass('down');
			this.visible = true;
		}
		else {
			this.toolbarContainer.slideUp(function() {
				if (opt_callback) {
					opt_callback();
				}
			});
			this.toolbar.saveState();
			this.container.removeClass('down');
			this.visible = false;
		}
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Panel
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var Panel = editor.ui.Panel = function(options) {
		this.widgets = [];
		options = options || {};
		
		if (options.classes) {
			options.classes.unshift('panel');
		} else {
			options.classes = ['panel'];
		}
		
		PanelBase.call(this, options);
	};
	var panelSuper = PanelBase.prototype;
		
	Panel.prototype = new PanelBase({ extending: true });
	Panel.prototype.constructor = Panel;
		
	Panel.prototype.finishLayout = function() {
		panelSuper.finishLayout.call(this);

		this.setVisible(false, true);
	};
	
	Panel.prototype.addWidget = function(widget) {
		var pnl = this;

		this.container.append(widget.getUI());
		this[widget.getName()] = widget;
		this.widgets.push(widget);

		widget.setMinHeight(parseInt(this.container.css('min-height'), 10));
		widget.addListener(editor.events.Invalidate, function(data) {
			pnl.resize();
		});
	};
	
	Panel.prototype.resize = function() {
		panelSuper.resize.call(this);
		
		for (var i = 0, il = this.widgets.length; i < il; i++) {
			this.widgets[i].sizeAndPosition();	
		}
	};
	
	Panel.prototype.setVisible = function(visible, opt_skipAnim) {
		if (visible !== this.visible) {
			panelSuper.setVisible.call(this, visible, opt_skipAnim);
			
			for (var i = 0, il = this.widgets.length; i < il; i++) {
				this.widgets[i].sizeAndPosition();	
			}
		}
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Full Panel
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var FullPanel = editor.ui.FullPanel = function(options) {
		options = options || {};
		options.minMax = false;
		
		if (options.classes) {
			options.classes.unshift('fullPanel');
		} else {
			options.classes = ['fullPanel'];
		}
		
		Panel.call(this, options);
	};
		
	FullPanel.prototype = new Panel({ extending: true });
	FullPanel.prototype.constructor = FullPanel;
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Widget
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	editor.ui.WidgetDefaults = {
		classes: [],
		height: editor.ui.Height.HALF,
		name: 'defaultName'
	};
	
	var Widget = editor.ui.Widget = function(options) {
		var newOpts = jQuery.extend({}, editor.ui.WidgetDefaults, options);
		
		if (newOpts.classes) {
			newOpts.classes.unshift('widget');
		} else {
			newOpts.classes = ['widget'];
		}
		
		this.minHeight = null;
		editor.ui.Component.call(this, newOpts);
	};
	var widgetSuper = editor.ui.Component.prototype;
		
	Widget.prototype = new editor.ui.Component();
	Widget.prototype.constructor = Widget;
		
	Widget.prototype.layout = function() {
		if (!this.container) {
			this.container = jQuery('<div></div>');
		}
	};
	
	Widget.prototype.finishLayout = function() {
		for (var i = 0, il = this.config.classes.length; i < il; i++) {
			this.container.addClass(this.config.classes[i]);
		}
		
		// make sure forms are widget forms
		this.find('form').addClass('widgetForm').submit(function() {
			return false;
		});
		this.sizeAndPosition();
	};
	
	Widget.prototype.getName = function() {
		return this.config.name;
	};
	
	Widget.prototype.getPreferredHeight = function() {
		return this.preferredHeight;
	};
	
	Widget.prototype.invalidate = function() {
		this.notifyListeners(editor.events.Invalidate, null);
	};
	
	Widget.prototype.setMinHeight = function(pnlHeight) {
		this.minHeight = pnlHeight;
	};
	
	Widget.prototype.setVisible = function(visible) {
		widgetSuper.setVisible.call(this, visible);
		var wgt = this;
		
		this.notifyListeners(editor.events.WidgetVisible, {
			widget: wgt,
			visible: visible
		});
	};
	
	Widget.prototype.sizeAndPosition = function() {
		var container = this.container,
			padding = parseInt(container.css('paddingBottom'), 10) +
				parseInt(container.css('paddingTop'), 10),
			win = jQuery(window),
			winHeight = this.minHeight ? Math.max(win.height(), this.minHeight) : win.height();
		
		switch(this.config.height) {
			case editor.ui.Height.FULL:
				container.height(winHeight - padding);
				break;
			case editor.ui.Height.HALF:
				container.height(winHeight/2 - padding);
				break;
			case editor.ui.Height.THIRD:
				container.height(winHeight/3 - padding);
				break;
			case editor.ui.Height.MANUAL:
				break;
		}
		
		// check scrollHeight
		if (container[0].scrollHeight > container.height() + padding) {
			container.addClass('hasScrollBar');
		}
		else {
			container.removeClass('hasScrollBar');
		}
	};
   
////////////////////////////////////////////////////////////////////////////////////////////////////
// Convenient Forms Widget
////////////////////////////////////////////////////////////////////////////////////////////////////
		
	var FormWidget = editor.ui.FormWidget = function(options) {
		this.checkers = [];
		options = options || {};
		
		if (options.classes) {
			options.classes.unshift('widgetWithForms');
		} else {
			options.classes = ['widgetWithForms'];
		}
		
		Widget.call(this, options);
	};
		
	FormWidget.prototype = new Widget();
	FormWidget.prototype.constructor = FormWidget;
		
	FormWidget.prototype.addInputsToCheck = function(inputs) {
		var wgt = this,
			checker;
		
		if (inputs instanceof editor.ui.ColorPicker) {
			checker = {
				input: inputs,
				saveable: function() {
					return this.input.getColor() != null;
				}
			};
			this.checkers.push(checker);
		}
		else if (inputs instanceof editor.ui.Input || inputs instanceof editor.ui.Vector) {
			checker = {
				input: inputs,
				saveable: function() {
					return this.input.getValue() != null;
				}
			};
			this.checkers.push(checker);
		}
		else if (inputs instanceof editor.ui.InputChecker) {
			this.checkers.push(inputs);
		}
		else if (inputs.each){
			inputs.each(function(ndx, elem) {
				var input = jQuery(elem),
					checker = {
							input: input,
							saveable: function() {
								return this.input.val() !== '';
							}
						};
				wgt.checkers.push(checker);
			});
		}
	};
	
	FormWidget.prototype.checkSaveable = function() {
		var list = this.checkers,
			isSafe = true;
		
		for (var ndx = 0, len = list.length; ndx < len && isSafe; ndx++) {
			isSafe = list[ndx].saveable();
		}
		
		return isSafe;
	};
	
	editor.ui.InputChecker = function(input) {
		this.input = input;
	};
	
	editor.ui.InputChecker.prototype = {
		saveable: function() {
			
		}
	};
   
////////////////////////////////////////////////////////////////////////////////////////////////////
// Convenient List Widget
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/*
	 * Configuration object for the ListWidget.
	 */
	editor.ui.ListWidgetDefaults = {
		name: 'listSBWidget',
		listId: 'list',
		prefix: 'lst',
		title: '',
		instructions: '',
		type: editor.ui.ListType.UNORDERED,
		sortable: false
	};
	
	var ListWidget = editor.ui.ListWidget = function(options) {
		var newOpts = jQuery.extend({}, editor.ui.ListWidgetDefaults, options);
		editor.ui.Widget.call(this, newOpts);
		
		this.items = new Hashtable();		
	};
	var listWidgetSuper = Widget.prototype;
		
	ListWidget.prototype = new Widget();
	ListWidget.prototype.constructor = ListWidget;
				
	ListWidget.prototype.add = function(obj) {			
		var li = this.items.get(obj._getId());
		
		if (!li) {
			li = this.createListItem();
				
			li.setText(obj.name);
			li.attachObject(obj);
			
			this.bindButtons(li, obj);
			
			this.list.add(li);
			this.items.put(obj._getId(), li);
		}
		
		return li;
	};
	
	ListWidget.prototype.bindButtons = function(li, obj) {
		var wgt = this;
		
		li.editBtn.bind('click', function(evt) {
			var obj = li.getAttachedObject();
			wgt.notifyListeners(editor.events.Edit, obj);
		});
		
		li.removeBtn.bind('click', function(evt) {
			var obj = li.getAttachedObject();
			
			if (editor.depends.check(obj)) {
				wgt.notifyListeners(editor.events.Remove, obj);
			}
		});
	};
	
	ListWidget.prototype.clear = function() {
		this.list.clear();
		this.items.clear();
	};
	
	ListWidget.prototype.createListItem = function() {
		return new editor.ui.EditableListItem();
	};
	
	ListWidget.prototype.layout = function() {
		listWidgetSuper.layout.call(this);
		this.title = jQuery('<h1>' + this.config.title + '</h1>');
		this.instructions = jQuery('<p>' + this.config.instructions + '</p>');
		
		this.list = new editor.ui.List({
			id: this.config.listId,
			prefix: this.config.prefix,
			type: this.config.type,
			sortable: this.config.sortable
		});
		
		this.container.append(this.title)
		.append(this.instructions)
		.append(this.list.getUI());
	};
	
	ListWidget.prototype.remove = function(obj) {
		var li = this.items.get(obj._getId()),
			retVal = false;
		
		if (li) {
			li.removeObject();
			this.list.remove(li);
			this.items.remove(obj._getId());
			retVal = true;
		}
		
		return retVal;
	};
	
	ListWidget.prototype.update = function(obj) {
		var li = this.items.get(obj._getId()),
			retVal = false;
		
		if (li) {
			li.setText(obj.name);
			li.attachObject(obj);
			retVal = true;
		}
		
		return retVal;
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
//                     			  Private Module Vars and Functions   		                      //
////////////////////////////////////////////////////////////////////////////////////////////////////

	var navBar = null;

////////////////////////////////////////////////////////////////////////////////////////////////////
//                     			   			Public Functions		  		                      //
////////////////////////////////////////////////////////////////////////////////////////////////////
		
	editor.ui.addNavPane = function(navPane, opt_liId) {
		navBar.add(navPane, opt_liId);
	};
	
	editor.ui.getNavBar = function() {
		return navBar;
	};
	
	editor.ui.getNavPane = function(title) {
		var navPane = navBar.get(title);
		
		if (!navPane) {
			navPane = new editor.ui.NavPane(title);
			navPane.setToolBar(new editor.ui.ToolBar());
			navBar.add(navPane);
		}
		
		return navPane;
	};
	
	editor.ui.initializeView = function(client) {
		var bdy = jQuery('body');
		
		client.setBGColor(0xffffff, 1);
		
		// create and size the webgl client
		// create the grid plane
		editor.grid = new editor.ui.GridPlane(client, EXTENT, FIDELITY);
		// create the plugin panel
		navBar = new NavBar();
			
		var cam = client.camera;
		cam.enableControl();
		cam.far = FARPLANE;
		cam.near = NEARPLANE;
		cam.name = 'Main Camera';
		
		var vp = hemi.createViewData(client.camera);
		vp.eye = new THREE.Vector3(0, 10, 40);
		vp.target = new THREE.Vector3(0, 0, 0);
		cam.moveToView(vp, 0);
		
		// do an initial resize
		editor.ui.resizeView();
		
		// add an empty panel for select boxes
		bdy.append('<div class="topBottomSelect"></div>');
	};
	
	editor.ui.resizeView = function() {
		var bdy = jQuery('body'),
			win = jQuery(window),
			vwr = jQuery('.mainView'),
		
			windowWidth = win.width(),
			windowHeight = win.height();
			
		if (windowWidth <= 1024) {
			bdy.addClass('ten24');
			windowWidth = 1024;
		}
		else {
			bdy.removeClass('ten24');
		}
		
		if (windowHeight <= 728) {
			windowHeight = 728;
			if (!bdy.hasClass('ten24')) {
				bdy.addClass('ten24');
			}
		}
		
		vwr.width(windowWidth);
		vwr.height(windowHeight);
		
		for (var i = 0, il = panels.length; i < il; i++) {
			panels[i].resize();
		}

		editor.client._resize();

		// For some reason, textBaseline gets reset when canvas is resized
		hemi.hudManager.resetTextBaseline();
	};

})();
