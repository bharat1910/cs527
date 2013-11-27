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

(function() {
	"use strict";
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
////////////////////////////////////////////////////////////////////////////////////////////////////

	var shorthand = editor.tools.browser,
		wgtSuper = editor.ui.Widget.prototype,
		materialsHash = new Hashtable(),
		
		HILIGHT_COLOR = new THREE.Color(0x75d0f4),
		HIGHLIGHT_MAT = new THREE.MeshBasicMaterial({
			color: 0x75d0f4
		});

	shorthand.init = function() {
		var navPane = editor.ui.getNavPane('Geometry'),
			
			mbrMdl = new BrowserModel(),
			mbrView = new BrowserView(),
			mbrCtr = new BrowserController();
		
		mbrCtr.setModel(mbrMdl);
		mbrCtr.setView(mbrView);
		
		navPane.add(mbrView);
		
		var model = editor.getModel('shapes');
		
		if (model) {
			model.addListener(editor.events.Created, function(shape) {
				mbrMdl.addShape(shape);
			});
			model.addListener(editor.events.Removing, function(shape) {
				mbrMdl.removeShape(shape);
			});
			model.addListener(editor.events.Updated, function(shape) {
				mbrMdl.updateShape(shape);
			});
		} else {
			editor.addListener(editor.events.PluginLoaded, function(name) {
				if (name === 'shapes') {
					var model = editor.getModel(name);
					
					model.addListener(editor.events.Created, function(shape) {
						mbrMdl.addShape(shape);
					});
					model.addListener(editor.events.Removing, function(shape) {
						mbrMdl.removeShape(shape);
					});
					model.addListener(editor.events.Updated, function(shape) {
						mbrMdl.updateShape(shape);
					});
				}
			});
		}
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Tool Definition
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	shorthand.constants = {
		// TODO: We need a better way of testing for our highlight shapes than
		// searching for this prefix.
		HIGHLIGHT_PRE: 'kuda_highlight_',
		SEL_HIGHLIGHT: 'selectorHighlight'	
	};
	
	shorthand.events = {
		// browser model events
		AddUserCreatedShape: "browser.AddUserCreatedShape",
		LoadException: "browser.LoadException",
		PickableSet: "browser.PickableSet",
		RemoveUserCreatedShape: "browser.RemoveUserCreatedShape",
		ServerRunning: 'browser.ServerRunning',
		ShapeSelected: "browser.ShapeSelected",
		TransformDeselected: "browser.TransformDeselected",
		TransformHidden: "browser.TransformHidden",
		TransformSelected: "browser.TransformSelected",
		TransformShown: "browser.TransformShown",
		UpdateUserCreatedShape: "browser.UpdateUserCreatedShape",
		
		// view events
		ShowPicked: "browser.ShowPicked",
		ManipState: "browser.ManipState",
		SetTransOpacity: "browser.SetTransOpacity",
		StartTransOpacity: "browser.StartTransOpacity",
		StopTransOpacity: "browser.StopTransOpacity",
		
		// hidden items widget events
		SetPickable: "browser.SetPickable",
		ShowHiddenItem: "browser.ShowHiddenItem",
		
		// model tree widget events
		DeselectTreeItem: "browser.DeselectTreeItem",
		SelectTreeItem: "browser.SelectTreeItem",
		
		// loader widget events
		LoadModel: "browser.LoadModel",
		UnloadModel: "browser.UnloadModel"
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Methods
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var owners = new Hashtable();
		
	function createJsonObj(node, parentNode, owner) {
		var c = getNodeChildren(node),
			nodeType = getNodeType(node),
			children = [],
			i;
			
		if (owner) {
			owners.put(node, owner);
		}
		
		if (parentNode == null) {
			parentNode = node;
			owner = node;
		}
		
		for (i = 0; c && i < c.length; i++) {
			var nodeJson = createJsonObj(c[i], parentNode, owner);
			children.push(nodeJson);
		}
		
		var tNode = {
			data: node.name,
			attr: {
				id: getNodeId(node),
				rel: nodeType
			},
			state: children.length > 0 ? 'closed' : 'leaf',
			children: children,
			metadata: {
				type: nodeType,
				actualNode: node,
				parent: parentNode
			}
		};
		
		return tNode;
	}
	
	function generateNodes(nodeName, closePath) {
		var paths = getNodePath(nodeName),
			toClose = [],
			i;
		
		for (i = 0; i < paths.length; ++i) {
			var node = this.tree.find('#' + paths[i]);
			
			if (node.length > 0) {
				if (closePath && this.tree.jstree('is_closed', node)) {
					toClose.unshift(node);
				}
				
				this.tree.jstree('open_node', node, false, true);
			}
		}
		
		for (i = 0; i < toClose.length; ++i) {
			this.tree.jstree('close_node', toClose[i], true);
		}
	}
	
	function getNodePath(nodeName) {
		var ndx = nodeName.indexOf('_'),
			names = [];
		
		ndx = nodeName.indexOf('_', ndx + 1);
		
		while (ndx > -1) {
			names.push(nodeName.substr(0, ndx));
			ndx = nodeName.indexOf('_', ndx + 1);
		}
		
		return names;
	}
	
	function getNodeChildren(node) {
		var children;
		
		if (node instanceof hemi.Model) {
			var citId = getCitNodeId(node),
				tranObj = {
					name: 'Transforms',
					children: [node.root],
					className: 'directory',
					nodeId: citId + '_trans'
				},
				matObj = {
					name: 'Materials',
					children: node.materials,
					className: 'directory',
					nodeId: citId + '_mats'
				};
			children = [tranObj, matObj];
		} else if (node instanceof hemi.Shape) {
			children = [{
					name: 'Transforms',
					children: [node.mesh],
					className: 'directory',
					nodeId: getCitNodeId(node) + '_trans'
				}];
		} else {
			children = node.children;
		}
		
		return children;
	}
	
	function getCitNodeId(cit) {
		var id = 'br_';
		
		if (cit instanceof hemi.Model) {
			id += 'models_';
		} else if (cit instanceof hemi.Shape) {
			id += 'shapes_';
		} else if (cit instanceof hemi.Transform || cit instanceof hemi.Mesh) {
			var owner = owners.get(cit);
			id = getCitNodeId(owner) + '_trans' + getTransformPath(cit, owner);
		} 
		
		id += cit._getId();
		return id;
	}

	function getNodeId(obj) {
		var isCitizen = obj._worldId != null,
			id = '';
		
		if (isCitizen) {
			id = getCitNodeId(obj);
		} else if (obj instanceof THREE.Material) {
			id = getCitNodeId(owners.get(obj)) + '_mats_' + obj.id;
		} else if (obj.className === 'directory') {
			id = obj.nodeId;
		}
		
		return id;
	}
	
	function getNodeType(node) {
		var type = 'obj';
		
		if (node instanceof hemi.Transform || node instanceof hemi.Mesh) {
			type = 'transform';
		}
		else if (node._worldId != null) {
			type = 'citizen';
		}
		else if (node instanceof THREE.Material) {
			type = 'material';
		}
		return type;
	}
	
	function getTransformPath(transform, owner) {
		var path = '_', 
			parent = transform.parent;
		
		if (parent != editor.client.scene) {
			path = parent._getId() + path;
			path = getTransformPath(parent, owner) + path;	
		}
		
		return path;
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Browser Model
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var BrowserModel = function() {
		editor.ToolModel.call(this, 'browser');
		
		this.selected = [];
		this.highlightedShapes = new Hashtable();
		this.currentShape = null;
		this.currentHighlightShape = null;
		this.currentTransform = null;
		this.msgHandler = null;
		this.shapHighlightMat = null;
		this.tranHighlightMat = null;
		this.curHandle = new editor.ui.TransHandles();
		this.models = [];
		this.highlightMaterial = new THREE.MeshPhongMaterial({
			color: 0x75d0f4,
			ambient: 0xffffff
		});
		
		var mdl = this;
		
		hemi.subscribe(hemi.msg.load,
			function(msg) {
				var src = msg.src;

				if (src instanceof hemi.Model) {
					src.root.name = src.name + '_root';
					mdl.processModel(src, src.root);
					mdl.notifyListeners(editor.events.Created, src);
				}
			});
			
		jQuery.ajax({
			url: '/models',
			dataType: 'json',
			success: function(data, status, xhr) {	
				mdl.models = data.models;
				mdl.notifyListeners(shorthand.events.ServerRunning, 
					mdl.models);
			},					
			error: function(xhr, status, err) {
				mdl.serverDown = true;
				mdl.notifyListeners(shorthand.events.ServerRunning,
					null);
			}
		});
	};
		
	BrowserModel.prototype = new editor.ToolModel();
	BrowserModel.prototype.constructor = BrowserModel;
		
	BrowserModel.prototype.addModel = function(url, modelName) {
		var model = new hemi.Model(editor.client),
			that = this;
		model.name = modelName;
		model.setFileName(url);
	};
	
	BrowserModel.prototype.addShape = function(shape) {
		this.notifyListeners(shorthand.events.AddUserCreatedShape, shape);
	};
	
	BrowserModel.prototype.deselectAll = function() {
		for (var i = 0, il = this.selected.length; i < il; i++) {
			this.deselectTransform(this.selected[i]);
		}
		
		this.deselectMaterial();
	};
	
	BrowserModel.prototype.deselectGeometry = function() {
		if (this.currentHighlightShape !== null) {
			var elements = this.currentHighlightShape.elements;
			
			for (var ee = 0; ee < elements.length; ee++) {
				elements[ee].material = this.tranHighlightMat;
			}
			
			this.currentShape = this.currentHighlightShape = null;
			this.notifyListeners(shorthand.events.ShapeSelected, null);
		}
	};
	
	BrowserModel.prototype.deselectMaterial = function() {
		if (this.currentMaterial) {
			this.currentMaterial.color = this.originalColor;
			this.currentMaterial = this.originalColor = null;
		}
	};
	
	BrowserModel.prototype.deselectTransform = function(transform) {
		var children = transform.children,
			ndx, len;
		
		for (ndx = 0, len = children.length; ndx < len; ndx++) {
			this.deselectTransform(children[ndx]);
		}
		
		ndx = this.selected.indexOf(transform);
		
		if (ndx !== -1) {
			this.selected.splice(ndx, 1);
			this.currentShape = null;
			this.curHandle.setTransform(null);
			this.notifyListeners(shorthand.events.ShapeSelected, null);
			this.unhighlightTransform(transform);
			this.notifyListeners(shorthand.events.TransformDeselected, transform);
		}
		
		if (this.currentTransform === transform) {
			this.currentTransform = null;
		}
	};
	
	BrowserModel.prototype.enableSelection = function(enable) {
		if (this.msgHandler !== null) {
			hemi.unsubscribe(this.msgHandler, hemi.msg.pick);
			this.msgHandler = null;
		}
		
		if (enable) {
			this.msgHandler = hemi.subscribe(
				hemi.msg.pick, 
				this, 
				"onPick", 
				[
					hemi.dispatch.MSG_ARG + "data.pickedMesh", 
					hemi.dispatch.MSG_ARG + "data.mouseEvent"
				]);
				
			this.highlightSelected();
		}
		else {
			this.unhighlightAll();
		}
	};
	
	BrowserModel.prototype.getSelectedTransforms = function() {
		return this.selected;
	};
	
	BrowserModel.prototype.hideSelected = function() {
		for (var i = 0, il = this.selected.length; i < il; i++) {
			this.hideTransform(this.selected[i]);
		}
	};
	
	BrowserModel.prototype.hideTransform = function(transform) {
		transform.visible = false;
		transform.pickable = false;
		this.notifyListeners(shorthand.events.TransformHidden, {
			transform: transform,
			owner: owners.get(transform)
		});
	};
	
	BrowserModel.prototype.highlightSelected = function() {
		for (var i = 0, il = this.selected.length; i < il; i++) {
			this.highlightTransform(this.selected[i]);
		}
	};
		
	BrowserModel.prototype.highlightTransform = function(transform) {
		var children = transform.children,
			geometry = transform.geometry;
		
		for (var ndx = 0, len = children.length; ndx < len; ndx++) {
			this.highlightTransform(children[ndx]);
		}
		
		if (geometry) {
			var mat = transform.material,
				hmat = this.highlightMaterial;

			if (geometry.materials) {
				materialsHash.put(transform, geometry.materials);
				var newMats = [];

				for (var i = 0, il = geometry.materials.length; i < il; i++) {
					var m = geometry.materials[i];					
					hmat.opacity = m.opacity;
					hmat.transparent = m.transparent;
					newMats.push(hmat);
				}

				geometry.materials = newMats;

			} else {
				materialsHash.put(transform, mat);
				hmat.opacity = mat.opacity;
				hmat.transparent = mat.transparent;
				transform.material = hmat;
			}
		}
	};
	
	BrowserModel.prototype.isSelected = function(transform, opt_owner) {
		var transforms;
		
		if (opt_owner != null) {
			transforms = this.selected.get(opt_owner._getId());
		} else {
			transforms = this.getSelectedTransforms();
		}
		
		return transforms.indexOf(transform) !== -1;
	};
	
	BrowserModel.prototype.onPick = function(pickedMesh, mouseEvent) {
		if (!this.curHandle.down) {			
			if (this.isSelected(pickedMesh) && mouseEvent.shiftKey) {
				this.deselectTransform(pickedMesh);
			}
			else {
				if (!mouseEvent.shiftKey) {
					this.deselectAll();
				}
				
				this.selectTransform(pickedMesh);
			}
		}
	};

	BrowserModel.prototype.processModel = function(model, transform) {
		var children = transform.children;

		if (!transform.visible) {
			this.notifyListeners(shorthand.events.TransformHidden, {
				transform: transform,
				owner: model
			});
		}

		for (var i = 0, il = children.length; i < il; ++i) {
			this.processModel(model, children[i]);
		}
	};
	
	BrowserModel.prototype.removeModel = function(model) {
		var transforms = [].concat(this.selected);
		
		for (var i = 0, il = transforms.length; i < il; i++) {
			var transform = transforms[i],
				owner = owners.get(transform);
			
			if (owner === model) {
				this.deselectTransform(transform);
			}

			owners.remove(transform);
		}
		
		this.notifyListeners(editor.events.Removing, model);
		model.cleanup();
	};
	
	BrowserModel.prototype.removeShape = function(shape) {
		this.deselectTransform(shape.mesh);
		this.notifyListeners(shorthand.events.RemoveUserCreatedShape, shape);
	};
	
	BrowserModel.prototype.selectMaterial = function(material) {
		this.currentMaterial = material;
		this.originalColor = material.color;
		material.color = HILIGHT_COLOR;
	};
	
	BrowserModel.prototype.selectTransform = function(transform) {		
		// First clean out any child transforms or shapes that may have been
		// previously selected.00
		this.deselectTransform(transform);
		this.curHandle.setTransform(transform);
		this.selected.push(transform);
					
		this.highlightTransform(transform);
		this.notifyListeners(shorthand.events.TransformSelected, transform);
		this.currentTransform = transform;
	};
	
	BrowserModel.prototype.setManipState = function(state) {
		this.curHandle.setDrawState(state);
	};
	
	BrowserModel.prototype.setOpacity = function(opacity, transform) {
		if (transform == null) {
			transform = this.currentTransform;
		}

		if (transform instanceof hemi.Transform) {
			var children = transform.children;
			for (var i = 0, il = children.length; i < il; i++) {
				this.setOpacity(opacity, children[i]);
			}
		} else {
			hemi.fx.setOpacity(transform, opacity);
		}
	};
	
	BrowserModel.prototype.setTransformPickable = function(transform, pickable) {
		transform.pickable = pickable;
		this.notifyListeners(shorthand.events.PickableSet, {
			tran: transform,
			pick: pickable
		});
	};
	
	BrowserModel.prototype.showSelected = function() {
		for (var i = 0, il = this.selected.length; i < il; i++) {
			this.showTransform(this.selected[i]);
		}
	};
	
	BrowserModel.prototype.showTransform = function(transform, opt_owner) {
		transform.visible = true;
		transform.pickable = true;
		this.notifyListeners(shorthand.events.TransformShown, transform);
	};
	
	BrowserModel.prototype.unhighlightAll = function() {
		for (var i = 0, il = this.selected.length; i < il; i++) {
			this.unhighlightTransform(this.selected[i]);
		}
	};
	
   BrowserModel.prototype.unhighlightTransform = function(transform) {
		var children = transform.children,
			geometry = transform.geometry;
		
		for (var ndx = 0, len = children.length; ndx < len; ndx++) {
			this.unhighlightTransform(children[ndx]);
		}
		
		if (geometry) {
			if (geometry.materials) {
				geometry.materials = materialsHash.get(transform);
			} else {
				transform.material = materialsHash.get(transform);
			}
		}
	};
	
	BrowserModel.prototype.updateShape = function(shape) {
		this.notifyListeners(shorthand.events.UpdateUserCreatedShape, shape);
	};
		
	BrowserModel.prototype.worldCleaned = function() {
		var models = hemi.world.getModels(),
			shapes = hemi.world.getShapes(),
			i, il;
		
		// turn off handles
		this.curHandle.setDrawState(editor.ui.trans.DrawState.NONE);
		
		for (i = 0, il = models.length; i < il; ++i) {
			this.notifyListeners(editor.events.Removing, models[i]);
		}
		
		for (i = 0, il = shapes.length; i < il; ++i) {
			this.notifyListeners(shorthand.events.RemoveUserCreatedShape, shapes[i]);
		}

		materialsHash.clear();
	};
		
	BrowserModel.prototype.worldLoaded = function() {
		
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Side Panel
////////////////////////////////////////////////////////////////////////////////////////////////////

	var SidePanel = function() {
		editor.ui.Panel.call(this, {
			classes: ['mbrSidePanel']
		});
		
		this.visibleWidget = null;
		this.buttonHash = new Hashtable();
	};
	var sidePnlSuper = editor.ui.Panel.prototype;
		
	SidePanel.prototype = new editor.ui.Panel();
	SidePanel.prototype.constructor = SidePanel;
		
	SidePanel.prototype.addWidget = function(widget, name) {
		sidePnlSuper.addWidget.call(this, widget);
		
		var button = jQuery('<button>' + name + '</button>'),
			pnl = this,
			id = 'mbr' + name.replace(' ', '');
		
		this.buttonHash.put(widget, button);
		widget.container.attr('id', id);
		button.attr('id', id + 'Btn')
		.bind('click', function() {
			// hide visible widget
			if (pnl.visibleWidget) {
				pnl.visibleWidget.setVisible(false);
				pnl.buttonHash.get(pnl.visibleWidget).removeClass('down');
			}
			widget.setVisible(true);
			pnl.visibleWidget = widget;
			button.addClass('down');
		});
		
		this.buttons.append(button);
		
		if (this.widgets.length === 1) {
			button.click();
		}
	};
	
	SidePanel.prototype.layout = function() {
		sidePnlSuper.layout.call(this);
		
		this.buttons = jQuery('<div class="panelButtons"></div>');
		this.container.prepend(this.buttons);
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Widget Private Methods
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	function brSizeAndPosition(wgt) {
		var container = wgt.container,
			btnPnlHeight = jQuery('.mbrSidePanel .panelButtons').outerHeight(),
			padding = parseInt(container.css('paddingBottom'), 10) +
				parseInt(container.css('paddingTop'), 10),
			win = jQuery(window),
			winHeight = win.height(),
			wgtHeight = winHeight - padding - btnPnlHeight;
		
		container.height(wgtHeight);
	}	
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Model Tree Widget
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	var ModelTreeWidget = function(options) {
		editor.ui.Widget.call(this, {
			name: 'modelTreeWidget'
		});
	};
		
	ModelTreeWidget.prototype = new editor.ui.Widget();
	ModelTreeWidget.prototype.constructor = ModelTreeWidget;
		
	ModelTreeWidget.prototype.addModel = function(model) {
		var modelData = createJsonObj(model);
		
		this.tree.jstree('create_node', this.tree.find('#br_models'), 
			'inside', {
				json_data: modelData
			});
	};
	
	ModelTreeWidget.prototype.addShape = function(shape) {
		var shapeData = createJsonObj(shape);
		
		this.tree.jstree('create_node', this.tree.find('#br_shapes'), 
			'inside', {
				json_data: shapeData
			});
	};
	
	ModelTreeWidget.prototype.deselectNode = function(nodeName) {
		var node = this.tree.find('#' + nodeName);
		this.tree.jstree('deselect_node', node);
	};
	
	ModelTreeWidget.prototype.layout = function() {
		wgtSuper.layout.call(this);	
			
		var wgt = this,
			baseJson = [{
				data: 'models',
				attr: {
					id: 'br_models',
					rel: 'type'
				},
				state: 'leaf',
				metadata: {
					type: 'type'
				}
			},
			{
				data: 'shapes',
				attr: {
					id: 'br_shapes',
					rel: 'type'
				},
				state: 'leaf',
				metadata: {
					type: 'type'
				}
			}];
		
		this.tree = jQuery('<div id="mbrTree"></div>');
		this.treeParent = jQuery('<div id="mbrTreeWrapper"></div>');
		this.tree.bind('select_node.jstree', function(evt, data) {
			var elem = data.rslt.obj,
				metadata = elem.data('jstree'),
				type = metadata.type,
				selected = wgt.tree.jstree('get_selected'),
				i, il, sel;
			
			switch(type) {
				case 'transform':
					// Deselect any non-transforms that may be selected
					for (i = 0, il = selected.length; i < il; i++) {
						sel = selected[i];
						var selData = jQuery(sel).data('jstree');
						
						if (selData.type !== type) {
							wgt.tree.jstree('deselect_node', sel);
						}
					}
					
					if (data.args[2] != null) {
						wgt.notifyListeners(shorthand.events.SelectTreeItem, {
							transform: metadata.actualNode,
							node: elem,
							mouseEvent: data.args[2],
							type: metadata.type
						});
						wgt.tree.jstree('toggle_node', elem);
					} else {
						wgt.container.scrollTo(elem, 400);
					}
					
					break;
				case 'material':
					var material = metadata.actualNode,
						model = metadata.parent;
					
					// Materials are always single selection
					for (i = 0, il = selected.length; i < il; i++) {
						sel = selected[i];
						
						if (sel !== elem[0]) {
							wgt.tree.jstree('deselect_node', sel);
						}
					}
					
					wgt.notifyListeners(shorthand.events.SelectTreeItem, {
						owner: model,
						material: material,
						type: metadata.type
					});
					
					break;
				default:
					wgt.tree.jstree('toggle_node', elem);
					break;
			}
		})
		.bind('deselect_node.jstree', function(evt, data) {
			var elem = data.rslt.obj,
				metadata = elem.data('jstree');
			
			if (metadata != null) {
				wgt.notifyListeners(shorthand.events.DeselectTreeItem, {
					node: metadata.actualNode,
					type: metadata.type
				});
			}
		})
		.jstree({
			'json_data': {
				'data': baseJson,
				'progressive_render': true
			},
			'types': {
				'types': {
					'shape': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '0 0'
						}
					},
					'transform': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-16px 0'
						}
					},
					'citizen': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-48px 0'
						}
					},
					'type' : {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-64px 0'
						}
					}
				}
			},
			'themes': {
				'dots': false
			},
			'ui': {
				'select_multiple_modifier': 'shift',
				'selected_parent_close': 'select_parent',
				'disable_selecting_children': true
			},
			'plugins': ['themes', 'types', 'json_data', 'ui']
		});
		
		this.detailsList = jQuery('<div id="mbrDetails"></div>').hide();
		this.treeParent.append(this.tree);
		this.container.append(this.detailsList).append(this.treeParent);
	};
	
	ModelTreeWidget.prototype.removeModel = function(model) {
		var node = this.tree.find('#' + getNodeId(model));
		this.tree.jstree('delete_node', node);
	};
	
	ModelTreeWidget.prototype.removeShape = function(shape) {
		var node = this.tree.find('#' + getNodeId(shape));
		this.tree.jstree('delete_node', node);
	};
	
	ModelTreeWidget.prototype.selectNode = function(nodeName) {
		generateNodes.call(this, nodeName, false);
		
		var node = this.tree.find('#' + nodeName);
		this.tree.jstree('select_node', node, false);
	};
	
	ModelTreeWidget.prototype.sizeAndPosition = function() {
		brSizeAndPosition(this);
	};
	
	ModelTreeWidget.prototype.updateShape = function(shape) {
		// shape transforms may invariably change so we need to replace the
		// whole node
		var shapeData = createJsonObj(shape),
			nodeName = getNodeId(shape);
		
		generateNodes.call(this, nodeName, true);
		var node = this.tree.find('#' + nodeName);
		
		this.tree.jstree('create_node', node, 'after', {
			json_data: shapeData
		});
		this.tree.jstree('delete_node', node);
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Hidden Items Widget
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var HiddenItemListItem = function() {
		editor.ui.ListItem.call(this);
	};
	var hdnLiSuper = editor.ui.ListItem.prototype;
		
	HiddenItemListItem.prototype = new editor.ui.ListItem();
	HiddenItemListItem.prototype.constructor = HiddenItemListItem;

	HiddenItemListItem.prototype.layout = function() {
		hdnLiSuper.layout.call(this);
		
		this.title = jQuery('<span></span>');
		this.pickBtn = jQuery('<input type="checkbox"/>');
		this.showBtn = jQuery('<button class="removeBtn">Show</button>');
		var btnDiv = jQuery('<div class="buttonContainer"></div>');
		var pickSpan = jQuery('<span style="float:left;">Pick</span>');
		
		pickSpan.append(this.pickBtn);
		btnDiv.append(pickSpan).append(this.showBtn);
		this.container.append(this.title).append(btnDiv);
	};
	
	HiddenItemListItem.prototype.setText = function(text) {
		this.title.text(text);
	};
	
	var HiddenItemsWidget = function(options) {
		editor.ui.Widget.call(this, {
			name: 'hiddenItemsWidget'
		});
		
		this.hiddenItems = new Hashtable();		
		this.ownerTransHash = new Hashtable();
	};
		
	HiddenItemsWidget.prototype = new editor.ui.Widget();
	HiddenItemsWidget.prototype.constructor = HiddenItemsWidget;
		
	HiddenItemsWidget.prototype.layout = function() {
		wgtSuper.layout.call(this);
		
		this.list = new editor.ui.List({
			listId: 'mbrHiddenList',
			prefix: 'mbrHidLst',
			type: editor.ui.ListType.UNORDERED
		});
		
		this.container.append(this.list.getUI());
	};
	
	HiddenItemsWidget.prototype.addHiddenItem = function(transform, owner) {
		var id = transform._getId();
		
		if (!this.hiddenItems.containsKey(id)) {
			var li = new HiddenItemListItem(),
				wgt = this;
				
			li.setText(transform.name);
			li.attachObject(transform);
			
			li.pickBtn.bind('click', function(evt) {
				var transform = li.getAttachedObject();
				wgt.notifyListeners(shorthand.events.SetPickable, {
					tran: transform,
					pick: this.checked
				});
			}).prop('checked', transform.pickable);

			li.showBtn.bind('click', function(evt) {
				var transform = li.getAttachedObject();
				wgt.notifyListeners(shorthand.events.ShowHiddenItem, transform);
			});
			
			var transforms = this.ownerTransHash.get(owner) || [];
			transforms.push(transform);
			
			this.list.add(li);
			this.hiddenItems.put(id, li);
			this.ownerTransHash.put(owner, transforms);
		}
	};
	
	HiddenItemsWidget.prototype.removeHiddenItem = function(transform) {
		var li = this.hiddenItems.remove(transform._getId());
		this.list.remove(li);
		
		if (this.hiddenItems.size() === 0) {
			this.setVisible(false);
		}
	};
	
	HiddenItemsWidget.prototype.removeOwner = function(owner) {
		var transforms = this.ownerTransHash.get(owner);
		
		if (transforms) {
			for (var ndx = 0, len = transforms.length; ndx < len; ndx++) {
				this.removeHiddenItem(transforms[ndx]);
			}
		}
	};
	
	HiddenItemsWidget.prototype.resize = function(maxHeight) {
		wgtSuper.resize.call(this, maxHeight);	
		var list = this.list.getUI(),
		
		// adjust the list pane height
			listHeight = maxHeight;
			
		if (listHeight > 0) {
			list.height(listHeight);
		}
	};
	
	HiddenItemsWidget.prototype.setPickable = function(transform, pickable) {
		var li = this.hiddenItems.get(transform._getId());
		
		if (li) {
			li.pickBtn.prop('checked', pickable);
		}
	};
	
	HiddenItemsWidget.prototype.showAll = function() {
		var listItems = this.hiddenItems.values();
		
		for (var ndx = 0, len = listItems.length; ndx < len; ndx++) {
			listItems[ndx].showBtn.click();
		}
	};
	
	HiddenItemsWidget.prototype.sizeAndPosition = function() {
		brSizeAndPosition(this);
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Model Loading Widget
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	function populateUnloadPanel(ldrWgt, removeModel) {
		var models = hemi.world.getModels(),
			sel = ldrWgt.find('#mbrUnloadPnl select'),
			btn = ldrWgt.find('#mbrUnloadPnl button');
		sel.empty().show();
		
		if (models.length === 0) {
			btn.attr('disabled', 'disabled');
			sel.append('<option value="-1">No Models to Unload</option>');
		} else {
			btn.removeAttr('disabled');
			sel.append('<option value="-1">Unload a Model</option>');
			for (var i = 0, il = models.length; i < il; i++) {
				var mdl = models[i];
			    if (!removeModel || removeModel._getId() != mdl._getId()) {
    				var prj = jQuery('<option value="' + mdl._getId() + '">' + mdl.name + '</option>');
	    			sel.append(prj);
                }
			}
		}
	};

	var LoaderWidget = function() {
		editor.ui.Widget.call(this, {
			name: 'loaderWidget',
			height: editor.ui.Height.MANUAL
		});
		
		this.importData = null;
	};
		
	LoaderWidget.prototype = new editor.ui.Widget();
	LoaderWidget.prototype.constructor = LoaderWidget;
		
	LoaderWidget.prototype.errorHandler = function(error) {
		this.showMessage(error);
	};
	
	LoaderWidget.prototype.createImportPanel = function() {			
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		
		var pnl = this.find('#mbrImportPnl'),
			btn = pnl.find('button'),
			wgt = this,				
	
			loadPnl = this.find('#mbrLoadPnl'),
			sel = loadPnl.find('select'),
			jsonFileEntry,
			regEx = /.+\.json/,
			processFile = function(fs, curFile, fileReadCounter) {
				var createFile = function(fileEntry) {
						fileEntry.createWriter(function(fileWriter) {
							fileWriter.onwriteend = function() {
								fileReadCounter--;
								if (fileReadCounter == 0 && jsonFileEntry) {
									var prj = jQuery('<option value="' + 
										jsonFileEntry.toURL() + '">' + 
										jsonFileEntry.name.split('.')[0] + '</option>');
									sel.append(prj);
								}
							};
							if (regEx.test(fileEntry.name)) {
								jsonFileEntry = fileEntry;
							}
							fileWriter.write(curFile);
						}, wgt.errorHandler);
					},			
					eraseCreateFile = function(fileEntry) {
						var name = fileEntry.name;
						(function(fileName) {
							fileEntry.remove(function() {
								fs.root.getFile(fileName, {create: true, exclusive: true}, 
									createFile, wgt.errorHandler);
							});
						})(name);
					};
									
				//Only one of these callbacks will get called
				//if file exists
				fs.root.getFile(curFile.name, {create: false, exclusive: true}, 
					eraseCreateFile);
				//if file doesn't exist
				fs.root.getFile(curFile.name, {create: true, exclusive: true}, 
					createFile);
			},

			fileInput = jQuery(':input[type="file"]'),
			fileDiv = fileInput.parent().parent();

		// We need to hide the file div because it interferes with the mouse
		// events for the minMax button.		
		fileDiv.hide();;
		
		if (window.requestFileSystem) {
			btn.bind('click', function(evt) {
				fileDiv.show();
				fileInput.focus().click();
				fileDiv.hide();
			})
			.file({multiple: true})
			.choose(function(evt, input) {
				var files = input.files,
					fileReadCounter = files.length;
				window.requestFileSystem(window.PERMANENT, 50 * 1024 * 1024, function(fs) {
					for (var i = 0; i < files.length; ++i) {
						processFile(fs, files[i], fileReadCounter);
					}
				}, wgt.errorHandler);
			});
		}
		else {
			btn.bind('click', function(evt) {
				wgt.errorHandler('Import not supported on this browser');
			});
		}
	};
	
	LoaderWidget.prototype.loadModelsFromLocalFS = function(selectElement) {
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
		var wgt = this;
		
		var regEx = /.+\.json/;
		function listResults(entries) {
			for (var i = 0; i < entries.length; ++i) {
				var entry = entries[i];
				if (regEx.test(entry.name)) {
					var prj = jQuery('<option value="' + entry.toURL() + '">' + entry.name.split('.')[0] + '</option>');
					selectElement.append(prj);
				}
			}
		}
		
		function toArray(list) {
			return Array.prototype.slice.call(list || [], 0);
		}

		if (window.requestFileSystem) {
			window.requestFileSystem(window.PERMANENT, 50 * 1024 * 1024, function(fs) {
				var dirReader = fs.root.createReader();
				var entries = [];

				// Call the reader.readEntries() until no more results are returned.
				var readEntries = function() {
					dirReader.readEntries (function(results) {
						if (!results.length) {
							listResults(entries);
						} 
						else {
							entries = entries.concat(toArray(results));
							readEntries();
						}
					}, wgt.errorHandler);
				};
	
				readEntries(); // Start reading dirs.
			});
		}
	};
	
	LoaderWidget.prototype.createLoadPanel = function() {				
		var pnl = this.find('#mbrLoadPnl'),
			sel = pnl.find('select'),
			ipt = pnl.find('input').hide(),
			wgt = this;	
	
		sel.bind('change', function() {
			if (sel.val() !== '-1') {
				wgt.showMessage('Loading Model...');
				var modelName = sel.find('option[value="' + sel.val() + '"]').text();
				wgt.notifyListeners(shorthand.events.LoadModel, {url: sel.val(), modelName: modelName});
			}
		});	
		
		ipt.bind('keydown', function(evt) {
			var code = (evt.keyCode ? evt.keyCode : evt.which),
				val = ipt.val();
			
			if (code == 13 && val !== '') { //Enter keycode
				wgt.showMessage('Loading Model...');
				var modelName = sel.find('option[value="' + sel.val() + '"]').text();
				wgt.notifyListeners(shorthand.events.LoadModel, {url: val, modelName: ipt.text()});
			}
		});
		
		this.loadModelsFromLocalFS(sel);

	};
	
	LoaderWidget.prototype.createUnloadPanel = function() {			
		var pnl = this.find('#mbrUnloadPnl'),
			sel = pnl.find('select'),
			wgt = this;
	
		sel.bind('change', function() {	
			var id = parseInt(sel.val(), 10);
			if (id !== -1) {
				var model = hemi.world.getCitizenById(id);
				
				if (editor.depends.check(model)) {
					wgt.notifyListeners(shorthand.events.UnloadModel, model);
				}
			}
		});	
		
		populateUnloadPanel(this);
	};
	
	LoaderWidget.prototype.layout = function() {
		wgtSuper.layout.call(this);
		this.container.append('<p id="mbrMsg"></p>' +
			'<form id="mbrLoadPnl">' +
			'	<input type="text" id="loadMdlSel" placeholder="Model Path:" />' +
			'	<select id="loadMdlIpt"></select>' +
			'</form>' +
			'<form id="mbrImportPnl">' +
			'	<button id="importMdlBtn">Import</button>' +
			'</form>' +
			'<form id="mbrUnloadPnl">' +
			'	<select id="unloadMdlSel"></select>' +
			'</form>');
		
		this.msgPanel = this.find('#mbrMsg').hide();
		this.container.find('select').sb({
			ddCtx: '.topBottomSelect',
			useTie: true
		});
		this.container.find('form').submit(function() { 
			return false; 
		});
		// Removing import panel until import is reenabled in the server
		this.find('#mbrImportPnl').hide();
		this.createImportPanel();
		this.createLoadPanel();
		this.createUnloadPanel();
	};
	
	LoaderWidget.prototype.showMessage = function(msg) {
		var wgt = this;
		
		this.msgPanel.text(msg).slideDown(200, function() {
			wgt.invalidate();
		});
	};
	
	LoaderWidget.prototype.updateLoadException = function(url) {
		this.importData = null;
		this.showMessage('Unable to load: ' + url);
		
		populateUnloadPanel(this);
	};
	
	LoaderWidget.prototype.updateModelLoaded = function(model) {
		var wgt = this,
			sel = this.find('#mbrLoadPnl select'),
			ipt = this.find('input');
		
		this.msgPanel.text('').slideUp(200, function() {		
			sel.val(-1).sb('refresh');
			ipt.val('');
			wgt.invalidate();
		});
		
		populateUnloadPanel(this);
	};
	
	LoaderWidget.prototype.updateModelRemoved = function(model) {
		var wgt = this;
		
		this.msgPanel.text('').slideUp(200, function() {		
			wgt.invalidate();
		});
		populateUnloadPanel(this, model, true);
	};
	
	LoaderWidget.prototype.updateServerRunning = function(models) {
		var importPnl = this.find('#mbrImportPnl'),
			loadPnl = this.find('#mbrLoadPnl'),
			sel = loadPnl.find('select'),
			ipt = loadPnl.find('input'),
			sb = loadPnl.find('.sb.selectbox');
			
		if (models == null) {
			importPnl.hide();
			sel.hide();
			sb.hide();
			ipt.show();
			
			this.invalidate();
		}
		else {									
			// Removing import panel until import is reenabled in the server
			importPnl.show();
		
			ipt.hide();
			sb.show();
			sel.empty().show() 
				.append('<option value="-1">Load a Model</option>');
				
			for (var i = 0, il = models.length; i < il; i++) {
				var mdl = models[i];
				var prj = jQuery('<option value="' + mdl.url + '">' + mdl.name + '</option>');
				sel.append(prj);
			}
			
			this.invalidate();
		}
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Transform Adjusting Widget
////////////////////////////////////////////////////////////////////////////////////////////////////

	var AdjustState = {
		NONE: -1,
		TRANSLATE: 0,
		ROTATE: 1,
		SCALE: 2	
	};
	
	var AdjustWidget = function() {
		editor.ui.Widget.call(this, {
			name: 'adjustWidget',
			height: editor.ui.Height.MANUAL
		});
		
		this.state = AdjustState.NONE;
		this.transform = null;
	};
		
	AdjustWidget.prototype = new editor.ui.Widget();
	AdjustWidget.prototype.constructor = AdjustWidget;
	
	AdjustWidget.prototype.enable = function(enable) {
		if (enable) {
			this.transBtn.removeAttr('disabled');
			this.rotateBtn.removeAttr('disabled');
			this.scaleBtn.removeAttr('disabled');
		}
		else {
			this.transBtn.attr('disabled', 'disabled');
			this.rotateBtn.attr('disabled', 'disabled');
			this.scaleBtn.attr('disabled', 'disabled');
			this.state = AdjustState.NONE;
		}
	};
		
	AdjustWidget.prototype.layout = function() {
		wgtSuper.layout.call(this);
		var wgt = this,
			form = jQuery('<form></form>').submit(function() { 
				return false; 
			}),
			notify = function(btn, msg) {					
				btn.toggleClass('down');
				
				if (!btn.hasClass('down')) {
					msg = editor.ui.trans.DrawState.NONE;	
				}
				wgt.notifyListeners(shorthand.events.ManipState, msg);
			};
		
		this.transBtn = jQuery('<button id="mbrTranslateBtn">Translate</button>');
		this.rotateBtn = jQuery('<button id="mbrRotateBtn">Rotate</button>');
		this.scaleBtn = jQuery('<button id="mbrScaleBtn">Scale</button>');

		var popup = editor.ui.createTooltip({
			cls: 'mbrPopup',
			mouseHide: false
		});

		form.append(this.transBtn).append(this.rotateBtn)
			.append(this.scaleBtn);
		this.container.append(form);
		
		this.transBtn.bind('click', function() {				
			wgt.rotateBtn.removeClass('down');
			wgt.scaleBtn.removeClass('down');
			wgt.state = AdjustState.TRANSLATE;
			notify(jQuery(this), editor.ui.trans.DrawState.TRANSLATE);
			wgt.buildPopup(popup, wgt.transBtn);
		});
		this.rotateBtn.bind('click', function() {				
			wgt.transBtn.removeClass('down');
			wgt.scaleBtn.removeClass('down');
			wgt.state = AdjustState.ROTATE;
			notify(jQuery(this), editor.ui.trans.DrawState.ROTATE);
			wgt.buildPopup(popup, wgt.rotateBtn);
		});
		this.scaleBtn.bind('click', function() {				
			wgt.rotateBtn.removeClass('down');
			wgt.transBtn.removeClass('down');
			wgt.state = AdjustState.SCALE;
			notify(jQuery(this), editor.ui.trans.DrawState.SCALE);
			wgt.buildPopup(popup, wgt.scaleBtn);
		});
	};

	AdjustWidget.prototype.buildPopup = function(popup, button) {
		if (button.hasClass('down')) {
			var container = jQuery('<form></form>'),
				acceptButton = jQuery('<button id="mbrAcceptButton">Accept</button>'),
				transform = this.transform,
				vector = this.buildVector(this.transform),
				state = this.state;

			container.submit(function() {
				return false;
			});
			acceptButton.bind('click', function() {
				if (state === AdjustState.TRANSLATE) {
					transform.position = new THREE.Matrix4().getInverse(transform.parent.matrixWorld).multiplyVector3(vector.getValue());
					transform.updateMatrix();
				}
				else if (state === AdjustState.SCALE) {
					if (transform.parent) {
						transform.scale = vector.getValue().divideSelf(hemi.utils.decompose(transform.parent).scale);
					}
					else {
						transform.scale = vector.getValue()
					}
					transform.updateMatrix();
				}
				else if (state === AdjustState.ROTATE) {
                    var rotation = vector.getValue();
                    rotation.x *= hemi.DEG_TO_RAD;
                    rotation.y *= hemi.DEG_TO_RAD;
                    rotation.z *= hemi.DEG_TO_RAD;
                    transform.rotation = rotation;
                    transform.updateMatrix();
				}
			});

			container.append(vector.getUI());
			container.append(acceptButton);
			popup.show(button, container, null, {
				top: 5,
				left: 0
			});
		
			jQuery(document).bind('click.mbr', function(e) {
				var target = jQuery(e.target),
					parent = target.parents('.tooltip, #' + button.attr('id'));
				
				if (parent.size() == 0 && target.attr('id') != button.attr('id')) {
					popup.hide(0);
				}
			});
		}
		else {
			popup.hide(0);
			jQuery(document).unbind('click.mbr');
		}
	};

	AdjustWidget.prototype.buildVector = function(transform) {
		var vector = new editor.ui.Vector3({
			validator: editor.ui.createDefaultValidator()
		});
		if (transform !== null) {
			if (this.state === AdjustState.TRANSLATE) {
				vector.setValue(transform.matrixWorld.getPosition());
			}
			else if (this.state === AdjustState.ROTATE) {
				var rotate = hemi.utils.decompose(transform).rotation;
				rotate = rotate instanceof THREE.Quaternion ? hemi.utils.quaternionToVector3(rotate) : rotate;
				rotate.x = rotate.x * hemi.RAD_TO_DEG;
				rotate.y = rotate.y * hemi.RAD_TO_DEG;
				rotate.z = rotate.z * hemi.RAD_TO_DEG;
				vector.setValue(rotate);
			}
			else if (this.state === AdjustState.SCALE) {
				vector.setValue(hemi.utils.decompose(transform).scale);
			}
		}
		
		return vector;
	};

	AdjustWidget.prototype.set = function(transform) {
		this.transform = transform;
	};
	
	AdjustWidget.prototype.reset = function() {
		this.scaleBtn.removeClass('down');
		this.rotateBtn.removeClass('down');
		this.transBtn.removeClass('down');
		this.state = AdjustState.NONE;
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Opacity Widget
////////////////////////////////////////////////////////////////////////////////////////////////////

	function getOpacity(transform) {
		var n, i, l = transform.children.length, opacity = null;

		if (transform instanceof hemi.Mesh) {
			opacity = materialsHash.get(transform).opacity;
		} else {
			for (i = 0; i < l; i++) {
				var o = getOpacity(transform.children[i]);
				opacity = opacity === null ? o : opacity > o ? opacity : o;
			}
		}

		return opacity;
	}
	
	var OpacityWidget = function() {
		editor.ui.Widget.call(this, {
			name: 'opacityWidget',
			height: editor.ui.Height.MANUAL
		});
	};
		
	OpacityWidget.prototype = new editor.ui.Widget();
	OpacityWidget.prototype.constructor = OpacityWidget;
	
	OpacityWidget.prototype.enable = function(enable) {
		if (enable) {
			this.slider.slider('enable');
		}
		else {
			this.slider.slider('disable');
		}
	};
		
	OpacityWidget.prototype.layout = function() {
		wgtSuper.layout.call(this);
		
		var wgt = this,
			label = jQuery('<label>Opacity</label>');
		this.slider = jQuery('<div id="mbrTransparencySlider"></div>');
		this.slider.slider({
			value: 100,
			range: 'min',
			slide: function(evt, ui) {								
				wgt.notifyListeners(shorthand.events.SetTransOpacity, 
					ui.value/100);
			},
			start: function(evt, ui) {
				wgt.notifyListeners(shorthand.events.StartTransOpacity);
			},
			stop: function(evt, ui) {
				wgt.notifyListeners(shorthand.events.StopTransOpacity);
			}
		})
		.find('.ui-slider-handle').append('<span></span>');
		
		this.container.append(label).append(this.slider)
			.addClass('opacity');
	};
	
	OpacityWidget.prototype.reset = function() {
		this.slider.slider('value', 100);
	};
	
	OpacityWidget.prototype.set = function(transform) {
		this.slider.slider('value', getOpacity(transform) * 100);
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Details Widget
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var DetailsType = {
		TRANSFORM: 0,
		MATERIAL: 1
	};
	
	function buildMaterialPopup(material, model) {
		var params = material.parameters,
			texture = material.map,
			image = texture.image,
			container = jQuery('<div></div>'),
			detCtn = jQuery('<div class="details"></div>');
		
		container.append(detCtn);
		detCtn.empty().append('<h2>' + image.src + '</h2>');
		
		var img = jQuery('<img />');
		img.attr('src', image.src);
		detCtn.append(img);
	
		return container;
	}
	
	function buildTransformPopup(transform) {
		var meshes = recurseTransforms(transform),
			meshList = new editor.ui.List(),
			container = jQuery('<div></div>'),
			detCtn = jQuery('<div><div class="details"></div><button class="back" href="#">Back</button></div>').hide(),
			backBtn = detCtn.find('.back'),
			detPnl = detCtn.find('.details'),
			clickFcn = function(evt) {
				var item = jQuery(this).data('liWidget'),
					data = item.getAttachedObject();
				showMeshDetails(data.mesh, data.transform, detPnl);
				detCtn.show();
				meshList.setVisible(false);
			};
		
		for (var ndx = 0, len = meshes.length; ndx < len; ndx++) {
			var mesh = meshes[ndx],
				name = mesh.name !== '' ? mesh.name : 'unnamed'; 
			
			if (name.match(shorthand.constants.HIGHLIGHT_PRE) === null) {
				var item = new editor.ui.ListItem();
				
				item.setText(name);
				item.attachObject({
					transform: transform,
					mesh: mesh
				});
				item.data('liWidget', item);
				item.container.bind('click', clickFcn);
				
				meshList.add(item);
			}
		}
		
		backBtn.bind('click', function() {
			detCtn.hide();
			meshList.setVisible(true);
		});
		
		container.append(detCtn).append(meshList.getUI());
		
		return container;
	}
	
	function recurseTransforms(mesh) {
		var meshes = [],
			children = mesh.children;
		
		if (mesh.geometry) {
			meshes.push(mesh);	
		}
		
		for (var i = 0, il = children.length; i < il; i++) {
			meshes = meshes.concat(recurseTransforms(children[i]));
		}
		
		return meshes;
	}
	
	function showMeshDetails(mesh, transform, pnl) {
		var //shapeInfo = hemi.picking.pickManager.createShapeInfo(shape, null),
			box = mesh.geometry.boundingBox,
			minExtent = box.min,
			maxExtent = box.max,
			title = jQuery('<h2>' + mesh.name + '</h2>'),
			dl = jQuery('<dl></dl>'),
			liTemplate = jQuery.template(null, '<li><span class="label">${Label}</span>${Value}</li>'),
			minDt = jQuery('<dt>Min Extent</dt>'),
			minDd = jQuery('<dd><ul></ul></dd>'),
			maxDt = jQuery('<dt>Max Extent</dt>'),
			maxDd = jQuery('<dd><ul></ul></dd>'),
			minData = [
				{ Label: 'x', Value: editor.utils.roundNumber(minExtent.x, 7) },
				{ Label: 'y', Value: editor.utils.roundNumber(minExtent.y, 7) },
				{ Label: 'z', Value: editor.utils.roundNumber(minExtent.z, 7) }
			],
			maxData = [
				{ Label: 'x', Value: editor.utils.roundNumber(maxExtent.x, 7) },
				{ Label: 'y', Value: editor.utils.roundNumber(maxExtent.y, 7) },
				{ Label: 'z', Value: editor.utils.roundNumber(maxExtent.z, 7) }
			];
			
		dl.append(minDt).append(minDd).append(maxDt).append(maxDd);
		pnl.empty().append(title).append(dl);
		
		jQuery.tmpl(liTemplate, minData).appendTo(minDd.find('ul'));
		jQuery.tmpl(liTemplate, maxData).appendTo(maxDd.find('ul'));		
	}
	
	var DetailsWidget = function() {
		editor.ui.Widget.call(this, {
			name: 'detailsWidget',
			height: editor.ui.Height.MANUAL
		});
	};
		
	DetailsWidget.prototype = new editor.ui.Widget();
	DetailsWidget.prototype.constructor = DetailsWidget;
		
	DetailsWidget.prototype.buildPopup = function() {
		if (this.type === DetailsType.TRANSFORM) {
			return buildTransformPopup.call(this, this.obj);
		}
		else {
			return buildMaterialPopup.call(this, this.obj.material, 
				this.obj.owner);
		}
	};
	
	DetailsWidget.prototype.layout = function() {
		wgtSuper.layout.call(this);
		
		this.btn = jQuery('<button id="mbrDetailsBtn">View Shapes</button>');
		this.form = jQuery('<form></form>').submit(function() {
			return false;
		});
		
		this.form.append(this.btn);
		this.container.append(this.form);
		
		var popup = editor.ui.createTooltip({
				cls: 'mbrPopup',
				mouseHide: false
			}),
			wgt = this;
		
		this.btn.bind('click', function(evt) {
			var btn = jQuery(this).toggleClass('down');
			
			if (btn.hasClass('down')) {
				popup.show(btn, wgt.buildPopup(), null, {
					top: 5,
					left: 0
				});
			
				jQuery(document).bind('click.mbr', function(e) {
					var target = jQuery(e.target),
						parent = target.parents('.tooltip, #mbrDetailsBtn');
					
					if (parent.size() == 0 && target.attr('id') != 'mbrDetailsBtn') {
						popup.hide(0);
						jQuery(document).unbind('click.mbr');
						btn.removeClass('down');
					}
				});
			}
			else {
				popup.hide(0);
				jQuery(document).unbind('click.mbr');
			}
		});
	};
	
	DetailsWidget.prototype.reset = function() {
		if (this.btn.hasClass('down')) {
			this.btn.click();
		}
	};
	
	DetailsWidget.prototype.set = function(obj, type) {
		if (obj) {
			this.container.show();
		}
		else {
			this.container.hide();
		}
		
		this.type = type;
		this.obj = obj;
		
		this.btn.text(type === DetailsType.TRANSFORM ? 'View Shapes' : 
			'View Texture');
			
		if ((type === DetailsType.MATERIAL && obj.material && obj.material.map == null) || 
				(type === DetailsType.TRANSFORM && obj.geometry == null)) {
			this.btn.attr('disabled', 'disabled');
		}
		else {
			this.btn.removeAttr('disabled');
		}
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
//                             Hide/Show Widget                               //
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var VisibilityWidget = function() {
		editor.ui.Widget.call(this, {
			name: 'visibilityWidget',
			height: editor.ui.Height.MANUAL
		});
	};
		
	VisibilityWidget.prototype = new editor.ui.Widget();
	VisibilityWidget.prototype.constructor = VisibilityWidget;
	
	VisibilityWidget.prototype.enable = function(enable) {
		if (enable) {
			this.visBtn.removeAttr('disabled');
		}
		else {
			this.visBtn.attr('disabled', 'disabled');
		}
	};
		
	VisibilityWidget.prototype.layout = function() {
		wgtSuper.layout.call(this);
		this.visBtn = jQuery('<button>Hide</button>');
		
		var form = jQuery('<form></form>').submit(function() {
				return false;
			}),
			wgt = this;
		
		form.append(this.visBtn);
		this.container.append(form);
		
		this.visBtn.bind('click', function() {
			wgt.notifyListeners(shorthand.events.ShowPicked, 
				!wgt.transform.visible);
			jQuery(this).text(wgt.transform.visible ? 'Hide' : 'Show');
		});
	};
	
	VisibilityWidget.prototype.reset = function() {
		this.set(null);
	};
	
	VisibilityWidget.prototype.set = function(transform) {
		this.transform = transform;			
		this.visBtn.text(this.transform == null || 
			this.transform.visible ? 'Hide' : 'Show');
	};

////////////////////////////////////////////////////////////////////////////////////////////////////
// View
////////////////////////////////////////////////////////////////////////////////////////////////////   	
	
	var BrowserView = function() {
		editor.ToolView.call(this, {
			toolName: 'Geometry Browser',
			toolTip: 'Browse through the transforms and materials of models and shapes',
			id: 'browser'
		});
		
		this.isDown = false;
		
		this.addPanel(new SidePanel());
		this.addPanel(new editor.ui.Panel({
			location: editor.ui.Location.TOP,
			classes: ['mbrTopPanel']
		}));
		this.addPanel(new editor.ui.Panel({
			location: editor.ui.Location.BOTTOM,
			classes: ['bottomPanel', 'mbrBottomPanel'],
			startsVisible: false
		}));
		
		this.sidePanel.addWidget(new ModelTreeWidget(), "Browser Tree");
		this.sidePanel.addWidget(new HiddenItemsWidget(), "Hidden Transforms");
		
		this.topPanel.addWidget(new LoaderWidget());
		
		this.bottomPanel.addWidget(new AdjustWidget());
		this.bottomPanel.addWidget(new OpacityWidget());
		this.bottomPanel.addWidget(new DetailsWidget());
		this.bottomPanel.addWidget(new VisibilityWidget());
	};
		
	BrowserView.prototype = new editor.ToolView();
	BrowserView.prototype.constructor = BrowserView;
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Controller
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var BrowserController = function() {
		editor.ToolController.call(this);
	};
	var brsCtrSuper = editor.ToolController.prototype;
		
	BrowserController.prototype = new editor.ToolController();
	BrowserController.prototype.constructor = BrowserController;
	
	/**
	 * Binds event and message handlers to the view and model this object
	 * references.
	 */
	BrowserController.prototype.bindEvents = function() {
		brsCtrSuper.bindEvents.call(this);
		
		var model = this.model,
			view = this.view,
			ldrWgt = view.topPanel.loaderWidget,
			mbrWgt = view.sidePanel.modelTreeWidget,
			hidWgt = view.sidePanel.hiddenItemsWidget,
			opaWgt = view.bottomPanel.opacityWidget,
			adjWgt = view.bottomPanel.adjustWidget,
			visWgt = view.bottomPanel.visibilityWidget,
			detWgt = view.bottomPanel.detailsWidget;			
		
		// for when the tool gets selected/deselected	
		view.addListener(editor.events.ToolModeSet, function(value) {
			var isDown = value.newMode === editor.ToolConstants.MODE_DOWN,
				wasDown = value.oldMode === editor.ToolConstants.MODE_DOWN,
				savedState = model.savedDrawState,
				handle = model.curHandle;
			
			model.enableSelection(isDown);
			
			if (isDown && savedState != null) {
				handle.setDrawState(savedState);
			}
			else if (!isDown && wasDown) {
				model.savedDrawState = model.curHandle.drawState;
				handle.setDrawState(editor.ui.trans.DrawState.NONE);
			}
			
			hidWgt.setVisible(isDown && hidWgt.hiddenItems.size() > 0);
		});
		
		// hidden list widget specific
		hidWgt.addListener(shorthand.events.SetPickable, function(data) {
			model.setTransformPickable(data.tran, data.pick);
		});
		hidWgt.addListener(shorthand.events.ShowHiddenItem, function(transform) {
			model.showTransform(transform);
		});
		
		// loader widget specific
		ldrWgt.addListener(shorthand.events.LoadModel, function(data) {
			model.addModel(data.url, data.modelName);
		});
		ldrWgt.addListener(shorthand.events.UnloadModel, function(mdl) {
			model.removeModel(mdl);
		});
		
		// mdl browser widget specific
		mbrWgt.addListener(shorthand.events.SelectTreeItem, function(value) {
			if (value.type === 'transform') {
				if (!value.mouseEvent.shiftKey) {
					model.deselectAll();
				}
				
				model.selectTransform(value.transform);
			} else if (value.type === 'material') {
				model.deselectAll();
				detWgt.set(value, DetailsType.MATERIAL);
				view.bottomPanel.setVisible(true);
				opaWgt.enable(false);
				visWgt.enable(false);
				adjWgt.enable(false);
				model.selectMaterial(value.material);
//				opaWgt.setVisible(false);
//				adjWgt.setVisible(false);
				// TODO: Do something useful like highlight the material so
				// that the user can see what shapes use it. ~ekitson
			}
		});			
		mbrWgt.addListener(shorthand.events.DeselectTreeItem, function(data) {
			if (data.type === 'transform') {
				model.deselectTransform(data.node);
			}
		});
		
		// bottom panel
		adjWgt.addListener(shorthand.events.ManipState, function(state) {
			model.setManipState(state);
		});
		opaWgt.addListener(shorthand.events.SetTransOpacity, function(opacity) {
			model.setOpacity(opacity);
		});
		opaWgt.addListener(shorthand.events.StartTransOpacity, function() {
			model.unhighlightTransform(model.currentTransform);
		});
		opaWgt.addListener(shorthand.events.StopTransOpacity, function() {
			model.highlightTransform(model.currentTransform);
		});
		visWgt.addListener(shorthand.events.ShowPicked, function(value) {
			if (value) {
				model.showSelected();
			} else {
				model.hideSelected();
			}
		});
					
		// mbr model specific
		model.addListener(editor.events.Created, function(model) {
			ldrWgt.updateModelLoaded(model);
			mbrWgt.addModel(model);
		});
		model.addListener(shorthand.events.LoadException, function(url) {
			ldrWgt.updateLoadException(url);
		});
		model.addListener(editor.events.Removing, function(model) {
			mbrWgt.removeModel(model);
			hidWgt.removeOwner(model);
			ldrWgt.updateModelRemoved(model);
			adjWgt.reset();
			detWgt.reset();
			opaWgt.reset();
			view.bottomPanel.setVisible(false);
		});
		
		model.addListener(shorthand.events.AddUserCreatedShape, function(shape) {
			var isDown = view.mode == editor.ToolConstants.MODE_DOWN;
			
			mbrWgt.addShape(shape);
			
			if (shape.mesh.visible === false) {
				hidWgt.addHiddenItem(shape.mesh, shape);
				hidWgt.setVisible(isDown);
			}
		});
		model.addListener(shorthand.events.RemoveUserCreatedShape, function(shape) {
			mbrWgt.removeShape(shape);
			hidWgt.removeOwner(shape);
		});	
		model.addListener(shorthand.events.ServerRunning, function(models) {
			ldrWgt.updateServerRunning(models);
		});
		model.addListener(shorthand.events.UpdateUserCreatedShape, function(shape) {
			mbrWgt.updateShape(shape);
		});
		model.addListener(shorthand.events.PickableSet, function(data) {
			hidWgt.setPickable(data.tran, data.pick);
		});
		model.addListener(shorthand.events.TransformDeselected, function(transform) {
			mbrWgt.deselectNode(getNodeId(transform));
		});
		model.addListener(shorthand.events.TransformHidden, function(obj) {
			var isDown = view.mode == editor.ToolConstants.MODE_DOWN;
			hidWgt.addHiddenItem(obj.transform, obj.owner);
			hidWgt.setVisible(isDown);
		});
		model.addListener(shorthand.events.TransformSelected, function(transform) {
			mbrWgt.selectNode(getNodeId(transform));
			detWgt.set(transform, DetailsType.TRANSFORM);
			visWgt.set(transform);
			opaWgt.set(transform);
			opaWgt.enable(true);
			visWgt.enable(true);
			adjWgt.enable(true);
			adjWgt.set(transform);
			
			if (view.mode === editor.ToolConstants.MODE_DOWN) {
				view.bottomPanel.setVisible(true);
			}
		});
		model.addListener(shorthand.events.TransformShown, function(transform) {
			hidWgt.removeHiddenItem(transform);
		});
		
		
		if (!model.serverRunning) {
			ldrWgt.updateServerRunning(null);
		}
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
// Extra Scripts
////////////////////////////////////////////////////////////////////////////////////////////////////

	editor.getCss('js/editor/plugins/browser/css/style.css');
})();
