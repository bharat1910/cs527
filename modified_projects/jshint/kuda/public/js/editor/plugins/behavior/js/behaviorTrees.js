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
	
	var shorthand = editor.tools.behavior;
	
	// model specific
	shorthand.events.CitizenAdded = 'Trees.CitizenAdded';
	shorthand.events.CitizenRemoved = 'Trees.CitizenRemoved';
	shorthand.events.CitizenUpdated = 'Trees.CitizenUpdated';
	
	// view specific
	shorthand.events.SelectAction = 'Trees.SelectAction';
	shorthand.events.SelectCitizen = 'Trees.SelectCitizen';
	shorthand.events.SelectTrigger = 'Trees.SelectTrigger';
	
	var TRIGGER_PREFIX = 'tr_',
		ACTION_PREFIX = 'ac_',
		CITIZEN_PREFIX = 'ci_';
	
////////////////////////////////////////////////////////////////////////////////////////////////////
//                                 				Tree Model		                                  //
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var TreeModel = function() {
		editor.utils.Listenable.call(this);
		this.octaneTypes = new Hashtable();

		hemi.subscribe(hemi.msg.worldCleanup, this, 'worldCleaned');
		hemi.subscribe(hemi.msg.ready, this, 'worldLoaded');
	};
		
	TreeModel.prototype = new editor.utils.Listenable();
	TreeModel.prototype.constructor = TreeModel;
		
	TreeModel.prototype.addCitizen = function(citizen) {
		if (citizen instanceof hemi.ValueCheck || citizen instanceof hemi.Client ||
				citizen instanceof hemi.Mesh || citizen instanceof hemi.Transform ||
				citizen instanceof hemi.Scene) {
			return;
		}
		
		var type = citizen._octaneType.split('.').pop(),
			citizens = this.octaneTypes.get(type),
			createType = citizens === null,
			add = createType;
		
		if (createType) {
			this.octaneTypes.put(type, [citizen]);
		} else {
			add = citizens.indexOf(citizen) === -1;
			
			if (add) {
				citizens.push(citizen);
				this.octaneTypes.put(type, citizens);
			}
		}
		
		if (add) {
			this.notifyListeners(shorthand.events.CitizenAdded, {
				citizen: citizen,
				createType: createType
			});
		}
	};
	
	TreeModel.prototype.listenTo = function(toolModel) {
		toolModel.addListener(editor.events.Created, this);
		toolModel.addListener(editor.events.Removing, this);
		toolModel.addListener(editor.events.Updated, this);
	};
	
	TreeModel.prototype.notify = function(eventType, value) {
		if (value._worldId != null) {
			if (eventType === editor.events.Created) {
				this.addCitizen(value);
			} else if (eventType === editor.events.Removing) {
				this.removeCitizen(value);
			} else if (eventType === editor.events.Updated) {
				this.updateCitizen(value);
			}
		}
	};
	
	TreeModel.prototype.removeCitizen = function(citizen) {
		var type = citizen._octaneType.split('.').pop(),
			citizens = this.octaneTypes.get(type),
			removeType = citizens !== null && citizens.length === 1,
			remove = removeType;
		
		if (removeType) {
			this.octaneTypes.remove(type);
		} else if (citizens !== null) {
			var ndx = citizens.indexOf(citizen);
			
			if (ndx !== -1) {
				remove = true;
				citizens.splice(ndx, 1);
				this.octaneTypes.put(type, citizens);
			}
		}
		
		if (remove) {
			this.notifyListeners(shorthand.events.CitizenRemoved, {
				citizen: citizen,
				removeType: removeType
			});
		}
	};
	
	TreeModel.prototype.updateCitizen = function(citizen) {
		this.notifyListeners(shorthand.events.CitizenUpdated, citizen);
	};
	
	TreeModel.prototype.worldCleaned = function() {
		var citizens = hemi.world.getCitizens();
		
		for (var ndx = 0, len = citizens.length; ndx < len; ndx++) {
			var citizen = citizens[ndx];
			
			if (citizen.name.match(editor.ToolConstants.EDITOR_PREFIX) === null) {
				this.removeCitizen(citizen);
			}
		}
	};
	
	TreeModel.prototype.worldLoaded = function() {
		var citizens = hemi.world.getCitizens();
		
		for (var ndx = 0, len = citizens.length; ndx < len; ndx++) {
			var citizen = citizens[ndx];
			
			if (citizen.name.match(editor.ToolConstants.EDITOR_PREFIX) === null) {
				this.addCitizen(citizen);
			}
		}
    };

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                 				Tree View		                                  //
////////////////////////////////////////////////////////////////////////////////////////////////////
	var idCounter = 0,
		tooltip = editor.ui.createTooltip({
			cls: 'tree'
		});
	
	var TreeView = function(type) {
		editor.ui.Component.call(this);
		this.type = type;
		this.tree = null;
		this.tooltips = new Hashtable(); 
		this.currentTooltip = null;
		this.currentTimeout = null;
		this.currentDehover = null;
		this.id = idCounter++;
		this.pre = type + this.id + '_';
		
		switch (type) {
			case CITIZEN_PREFIX:
				createCitizenTree.call(this, []);
				break;
			case TRIGGER_PREFIX:
				createTriggerTree.call(this, []);
				break;
			case ACTION_PREFIX:
				createActionTree.call(this, []);
				break;
		}
		
		var view = this;
		
		this.tree.bind('hover_node.jstree', function(evt, data) {
			var elem = data.rslt.obj,
				id = elem.attr('id'),
				desc = view.tooltips.get(id);
			
			if (view.currentTooltip !== id && desc != null) {		
				view.currentTooltip = id;	
				
				var t = setTimeout(function() {
					elem.data('timeout', null);
					tooltip.show(elem, desc);
				}, 500);
				
				elem.data('timeout', t);
			}
		})
		.bind('dehover_node.jstree', function(evt, data) {
			var elem = data.rslt.obj,
				timeout = elem.data('timeout');
				
			if (timeout != null) {
				clearTimeout(timeout);
			}
		})
		.bind('select_node.jstree', function(evt, data) {		
			var elem = data.rslt.obj,
				timeout = elem.data('timeout');
							
			if (view.currentTooltip != null) {
				clearTimeout(timeout);
				tooltip.hide(100);
				view.currentTooltip = null;
			}
		})
		.bind('mouseout', function(evt) {
			if (view.currentTooltip != null && !tooltip.isAnimating) {
				tooltip.hide(100);
				view.currentTooltip = null;
			}
		});
	};
	
	TreeView.prototype = new editor.ui.Component();
	TreeView.prototype.constructor = TreeView;
		
	TreeView.prototype.bindSelect = function(func) {
		this.tree.bind('select_node.jstree', func);
	};
	
	TreeView.prototype.clearFilter = function() {
		var tree = jQuery.jstree._reference(this.tree),
			nodes = tree._get_children(-1),
			mainNode = tree._get_node('#' + this.filterId);
			
		nodes.show();
		mainNode.removeClass('jstree-last');
	};
	
	TreeView.prototype.deselect = function(data) {				
		switch (this.type) {
			case TRIGGER_PREFIX:
				deselectTrigger.call(this, data);
				break;
			case ACTION_PREFIX:
				deselectAction.call(this, data);
				break;
		}
	};
	
	TreeView.prototype.filter = function(type) {
		var id = shorthand.treeData.getNodeName(type.split('.').pop() + 'Type', {
				prefix: this.pre
			});

		this.generateNodes(id);

		var tree = jQuery.jstree._reference(this.tree),
			nodes = tree._get_children(-1),
			mainNode = tree._get_node('#' + id);
			
		nodes.hide();
		if (mainNode) {
			mainNode.show().addClass('jstree-last');
		}
		else {
			throw type + " can't be found";
		}
		
		this.filterId = id;
	};

	TreeView.prototype.generateNodes = function(nodeName, closePath) {
		var paths = shorthand.treeData.getNodePath(nodeName),
			toClose = [];
		
		for (var i = 0; i < paths.length; ++i) {
			var node = jQuery('#' + paths[i], this.tree);
			
			if (closePath && this.tree.jstree('is_closed', node)) {
				toClose.unshift(node);
			}
			
			this.tree.jstree('open_node', node, false, true);
		}
		
		for (var i = 0; i < toClose.length; ++i) {
			this.tree.jstree('close_node', toClose[i], true);
		}
	};
	
	TreeView.prototype.notify = function(eventType, value) {
		if (eventType === shorthand.events.CitizenAdded) {
			var citizen = value.citizen, 
				createType = value.createType;
				
			switch (this.type) {
				case CITIZEN_PREFIX:
					addCitizen.call(this, citizen, createType);
					break;
				case TRIGGER_PREFIX:
					addTrigger.call(this, citizen, createType);
					break;
				case ACTION_PREFIX:
					addAction.call(this, citizen, createType);
					break;
			}
		}
		else if (eventType === shorthand.events.CitizenRemoved) {
			var citizen = value.citizen, 
				removeType = value.removeType;
				
			switch (this.type) {
				case CITIZEN_PREFIX:
					removeCitizen.call(this, citizen, removeType);
					break;
				case TRIGGER_PREFIX:
					removeTrigger.call(this, citizen, removeType);
					break;
				case ACTION_PREFIX:
					removeAction.call(this, citizen, removeType);
					break;
			}
		}
		else if (eventType === shorthand.events.CitizenUpdated) {
			this.update(value);
			
			if (this.type === TRIGGER_PREFIX) {
				updateTrigger.call(this, value);
			}
		}
	};
	
	TreeView.prototype.restrictSelection = function(citizen, options) {
		var id = citizen._getId ? citizen._getId() : null,
			nodeName = shorthand.treeData.getNodeName(citizen, {
				prefix: this.pre
			});
		
		this.generateNodes(nodeName, false);
		var node = jQuery('#' + nodeName, this.tree);
		this.tree.jstree('open_node', node, false, true);
		this.tree.addClass('restricted');
		
		for (var ndx = 0, len = options.length; ndx < len; ndx++) {
			var option = options[ndx],
				config = {
					prefix: this.pre
				},
				cit = citizen;

			if (option instanceof hemi.Viewpoint) {
				config.parent = citizen;
				cit = option;
			} else {
				config.option = option;
			}
			nodeName = shorthand.treeData.getNodeName(cit, config);
			
			node = jQuery('#' + nodeName, this.tree);
			node.find('a').addClass('restrictedSelectable');
		}
	};
	
	TreeView.prototype.select = function(citizen, option) {
		if (citizen === null || option === null) {
			this.tree.jstree('deselect_all');
		} else {
			var nodeName = shorthand.treeData.getNodeName(citizen, {
					option: option,
					prefix: this.pre
				});
			
			this.generateNodes(nodeName, false);
			var node = jQuery('#' + nodeName);
			
			if (this.tree.jstree('is_leaf', node)) {
				this.tree.jstree('select_node', node, true);
			} else {
				this.tree.jstree('open_node', node, false, true);
			}
			
			this.tree.parent().scrollTo(node, 400);
		}
	};
	
	TreeView.prototype.unrestrictSelection = function(citizen, msgs) {
		var id = citizen._getId ? citizen._getId() : null;
		this.tree.removeClass('restricted');
		
		for (var ndx = 0, len = msgs.length; ndx < len; ndx++) {
			var nodeName = shorthand.treeData.getNodeName(citizen, {
					option: msgs[ndx],
					prefix: this.pre
				}),
				node = jQuery('#' + nodeName, this.tree);
			
			node.find('a').removeClass('restrictedSelectable');
		}
	};
	
	TreeView.prototype.update = function(citizen) {
		var nodeName = shorthand.treeData.getNodeName(citizen, {
				prefix: this.pre
			});
		
		this.generateNodes(nodeName, true);
		var node = jQuery('#' + nodeName, this.tree);
		this.tree.jstree('rename_node', node, citizen.name);
		
		// shape case
		
		// camera move case
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
//                         				Tree View Private Methods		                          //
////////////////////////////////////////////////////////////////////////////////////////////////////
		
	function addAction(citizen, createType) {
		if (createType) {
			addActionType.call(this, citizen);
		}
		
		var actionNode = shorthand.treeData.createActionJson(citizen, this.pre),
			type = citizen._octaneType.split('.').pop() + 'Type';
			
		if (citizen instanceof hemi.Model) {
			shorthand.treeData.createModelTransformActionJson(citizen, actionNode, this.pre);
		} else if (citizen instanceof hemi.Shape) {
			shorthand.treeData.createShapeTransformActionJson(citizen, actionNode, this.pre);
		}
			
		this.tree.jstree('create_node', '#' + this.pre + type, 'inside', {
			json_data: actionNode
		});
		for (var propName in citizen) {
			var prop = citizen[propName];
			
			if (jQuery.isFunction(prop)) {
				addToolTip.call(this, citizen, propName);
			}
		}
	};
	
	function addActionType(citizen) {
		var json = shorthand.treeData.createOctaneTypeJson(citizen, this.pre);
		
		this.tree.jstree('create_node', -1, 'last', {
			json_data: json
		});
		
		addToolTip.call(this, citizen);
	};
	
	function addCitizen(citizen, createType) {
		if (createType) {
			addOctaneType.call(this, citizen);
		}
		
		var citizenNode = shorthand.treeData.createCitizenJson(citizen, 
				this.pre),
			type = citizen._octaneType.split('.').pop() + 'Type';
			
		this.tree.jstree('create_node', '#' + this.pre + type, 'inside', {
			json_data: citizenNode
		});
	};	
	
	function addOctaneType(citizen) {
		var json = shorthand.treeData.createOctaneTypeJson(citizen, this.pre);
		
		this.tree.jstree('create_node', -1, 'last', {
			json_data: json
		});
	};
	
	function addToolTip(citizen, opt_func) {
		var nodeId = shorthand.treeData.getNodeName(citizen, {
				prefix: this.pre,
				option: opt_func
			}),
			type = citizen._octaneType,
			desc;
		
		if (opt_func) {
			desc = editor.data.getMetaData().getDescription(type, opt_func);
		} else if (type === shorthand.constants.SHAPE_PICK) {
			desc = 'A Picked Shape is triggered when the user clicks on a shape that is part of a Model.';
		} else if (type === shorthand.constants.CAM_MOVE) {
			desc = 'A Camera Move is triggered when a Camera arrives at a Viewpoint.';
		} else {
			desc = editor.data.getMetaData().getDescription(type);
		}
		
		if (desc != null) {
			this.tooltips.put(nodeId, desc);
		}
	};
	
	function addTrigger(citizen, createType) {
		if (createType) {
			addTriggerType.call(this, citizen);
		}
		
		var triggerNode = shorthand.treeData.createTriggerJson(citizen, 
				this.pre),
			type = citizen._octaneType.split('.').pop(),
			msgSent = citizen._msgSent,
			name = shorthand.treeData.getNodeName(citizen, {
					option: shorthand.treeData.MSG_WILDCARD,
					prefix: this.pre
				});
		
		this.tooltips.put(name, 'any of the triggers for the ' + type);
		
		if (citizen instanceof hemi.Model) {
			shorthand.treeData.createModelPickJson(citizen, triggerNode, this.pre);
			shorthand.treeData.createModelTransformTriggerJson(citizen, triggerNode, this.pre);
		} else if (citizen instanceof hemi.Shape) {
			shorthand.treeData.createShapePickJson(citizen, triggerNode, this.pre);
			shorthand.treeData.createShapeTransformTriggerJson(citizen, triggerNode, this.pre);
		} else if (citizen instanceof hemi.Camera) {
			var cmc = shorthand.treeData.createCamMoveCitizen(citizen),
				cmcTriggerNode = shorthand.treeData.createCamMoveJson(cmc, this.pre),
				cmcType = cmc._octaneType.split('.').pop();
			
			this.tree.jstree('create_node', '#' + this.pre + cmcType, 'inside', {
				json_data: cmcTriggerNode
			});
		} else if (citizen instanceof hemi.Viewpoint) {
			// In future if we support multiple cameras, this will need to
			// be updated
			var cmc = shorthand.treeData.createCamMoveCitizen(editor.client.camera),
				nodeName = shorthand.treeData.getNodeName(cmc, {
					prefix: this.pre
				}),
				node = jQuery('#' + nodeName);
			
			if (node.length > 0) {
				triggerNode = shorthand.treeData.createViewpointJson(cmc, 
					citizen, this.pre);
				
				this.tree.jstree('create_node', node, 'inside', {
					json_data: triggerNode
				});
			}
		}

		this.tree.jstree('create_node', '#' + this.pre + type + 'Type', 'inside', {
			json_data: triggerNode
		});
		
		for (var i = 0, il = msgSent ? msgSent.length : 0; i < il; ++i) {
			addTriggerToolTip.call(this, citizen, citizen._msgSent[i]);
		}
	};
	
	function addTriggerToolTip(citizen, msg) {
		var nodeId = shorthand.treeData.getNodeName(citizen, {
					prefix: this.pre,
					option: msg
				});
		
		msg = msg.split('.').pop();
		var desc = editor.data.getMetaData().getMsgDescription(citizen._octaneType, msg);
		
		if (desc != null) {
			this.tooltips.put(nodeId, desc);
		}
	};
	
	function addTriggerType(citizen) {
		var json = shorthand.treeData.createOctaneTypeJson(citizen, this.pre);
		
		this.tree.jstree('create_node', -1, 'last', {
			json_data: json
		});
		
		addToolTip.call(this, citizen);
		
		if (citizen instanceof hemi.Camera) {
			var cmc = shorthand.treeData.createCamMoveCitizen(citizen);
			json = shorthand.treeData.createCamMoveTypeJson(cmc, this.pre);
			
			this.tree.jstree('create_node', -1, 'last', {
				json_data: json
			});
			
			addToolTip.call(this, cmc);
		}
	};
	
	function createActionTree(json) {
		this.tree = jQuery('<div class="sharedTree"></div>');
		this.container = this.tree;
		
		this.tree.jstree({
			'json_data': {
				'data': json,
				'progressive_render': true
			},
			'types': {
				'types': {
					'method': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-80px 0'
						}
					},
					'citizen': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-48px 0'
						}
					},
					'citType': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-64px 0'
						}
					},
					'other': {}
				}
			},
			'themes': {
				'dots': false
			},
			'ui': {
				'select_limit': 1,
				'selected_parent_close': 'false'
			},
			'plugins': ['json_data', 'sort', 'themes', 'types', 'ui']
		});
	};
	
	function createCitizenTree(json) {
		this.tree = jQuery('<div></div>');
		this.container = this.tree;
		
		this.tree.jstree({
			'json_data': {
				'data': json,
				'progressive_render': true
			},
			'types': {
				'types': {
					'citizen': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-48px 0'
						}
					},
					'citType': {
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
				'select_limit': 1,
				'selected_parent_close': 'false'
			},
			'plugins': ['json_data', 'sort', 'themes', 'types', 'ui']
		});
	};
			
	function createTriggerTree(json) {
		var wildcardTrigger = shorthand.treeData.createWildcardJson(this.pre);
		
		json.unshift(wildcardTrigger);
		this.tree = jQuery('<div class="sharedTree"></div>');
		this.container = this.tree;
		
		this.tree.jstree({
			'json_data': {
				'data': json,
				'progressive_render': true
			},
			'types': {
				'types': {
					'message': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-80px 0'
						}
					},
					'citizen': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-48px 0'
						}
					},
					'citType': {
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
				'select_limit': 1,
				'selected_parent_close': 'false'
			},
			'plugins': ['json_data', 'sort', 'themes', 'types', 'ui']
		});
		
		var wildcard = shorthand.treeData.MSG_WILDCARD,
			name = shorthand.treeData.getNodeName(wildcard, {
				option: wildcard,
				prefix: this.pre
			});
		
		this.tooltips.put(name, 'any trigger from any source');
		
		name = shorthand.treeData.getNodeName(wildcard, {
			prefix: this.pre
		});
		
		this.tooltips.put(name, 'a trigger from any source');
	};
	
	function deselectAction(data) {
		var citizen = data.citizen, 
			method = data.method,
			nodeName = shorthand.treeData.getNodeName(citizen, {
				option: method,
				prefix: this.pre
			}),
        	node = jQuery('#' + nodeName),
			actionText = jQuery('#msgEdtEffectTxt');
		
		this.tree.jstree('deselect_node', node);
		actionText.text('');
	};
	
	function deselectTrigger(data) {
		var citizen = data.citizen, 
			message = data.message,
			nodeName = shorthand.treeData.getNodeName(citizen, {
				option: message,
				prefix: this.pre
			}),
        	node = jQuery('#' + nodeName),
			triggerText = jQuery('#msgEdtCauseTxt');
		
		this.tree.jstree('deselect_node', node);
		triggerText.text('');
	};
	
	function removeAction(citizen, removeType) {
		var id = citizen._getId ? citizen._getId() : null,
			nodeName = shorthand.treeData.getNodeName(citizen, {
				prefix: this.pre
			});
		
		var node = jQuery('#' + nodeName);
		this.tree.jstree('delete_node', node);

		if (citizen instanceof hemi.Model || citizen instanceof hemi.Shape) {
			var spc = shorthand.treeData.createShapePickCitizen(citizen),
				tc = shorthand.treeData.createTransformCitizen(citizen);
			nodeName = shorthand.treeData.getNodeName(spc, {
				prefix: this.pre
			});
			this.tree.jstree('delete_node', jQuery('#' + nodeName));
			
			nodeName = shorthand.treeData.getNodeName(tc, {
				prefix: this.pre
			});
			this.tree.jstree('delete_node', jQuery('#' + nodeName));
		}
		
		if (removeType) {
			removeActionType.call(this, citizen);
		}
	};
	
	function removeActionType(citizen) {
		var nodeName = shorthand.treeData.getNodeName(citizen._octaneType.split('.').pop() + 
			'Type', { prefix: this.pre });
		
		var node = jQuery('#' + nodeName);
		this.tree.jstree('delete_node', node);

		if (citizen instanceof hemi.Model || citizen instanceof hemi.Shape) {
			nodeName = shorthand.treeData.getNodeName(shorthand.constants.TRANSFORM, {
				prefix: this.pre
			});
			
			node = jQuery('#' + nodeName);
			var nodeJson = this.tree.jstree('get_json', node);
			
			if (!nodeJson[0].children) {
				this.tree.jstree('delete_node', node);
			}
		}
	};
	
	function removeCitizen(citizen, removeType) {
		var nodeName = shorthand.treeData.getNodeName(citizen, {
			prefix: this.pre
		});
		
		var node = jQuery('#' + nodeName);
		this.tree.jstree('delete_node', node);
		
		if (removeType) {
			removeOctaneType.call(this, citizen);
		}
	};
	
	function removeOctaneType(citizen) {
		var nodeName = shorthand.treeData.getNodeName(citizen._octaneType.split('.').pop(), {
			prefix: this.pre
		});
		
		var node = jQuery('#' + nodeName);
		this.tree.jstree('delete_node', node);
	};
	
	function removeTrigger(citizen, removeType) {
		var id = citizen._getId ? citizen._getId() : null,
			nodeName = shorthand.treeData.getNodeName(citizen, {
				prefix: this.pre
			});
		
		var node = jQuery('#' + nodeName);
		this.tree.jstree('delete_node', node);
		
		if (citizen instanceof hemi.Model || citizen instanceof hemi.Shape) {
			var spc = shorthand.treeData.createShapePickCitizen(citizen),
				tc = shorthand.treeData.createTransformCitizen(citizen);
			nodeName = shorthand.treeData.getNodeName(spc, {
				prefix: this.pre
			});
			this.tree.jstree('delete_node', jQuery('#' + nodeName));
			
			nodeName = shorthand.treeData.getNodeName(tc, {
				prefix: this.pre
			});
			this.tree.jstree('delete_node', jQuery('#' + nodeName));
		} else if (citizen instanceof hemi.Camera) {
			var cmc = shorthand.treeData.createCamMoveCitizen(citizen);
			nodeName = shorthand.treeData.getNodeName(cmc, {
				prefix: this.pre
			});
			
			node = jQuery('#' + nodeName);
			this.tree.jstree('delete_node', node);
		} else if (citizen instanceof hemi.Viewpoint) {
			// In future if we support multiple cameras, this will need to
			// be updated
			var cmc = shorthand.treeData.createCamMoveCitizen(editor.client.camera);
			nodeName = shorthand.treeData.getNodeName(citizen, {
				prefix: this.pre,
				parent: cmc
			});
			
			node = jQuery('#' + nodeName);
			this.tree.jstree('delete_node', node);
		}
		
		if (removeType) {
			removeTriggerType.call(this, citizen);
		}
	};
	
	function removeTriggerType(citizen) {
		var nodeName = shorthand.treeData.getNodeName(citizen._octaneType.split('.').pop() + 'Type', {
			prefix: this.pre
		});
		
		var node = jQuery('#' + nodeName);
		this.tree.jstree('delete_node', node);
		
		if (citizen instanceof hemi.Model || citizen instanceof hemi.Shape) {
			nodeName = shorthand.treeData.getNodeName(shorthand.constants.SHAPE_PICK, {
				prefix: this.pre
			});
			
			node = jQuery('#' + nodeName);
			var nodeJson = this.tree.jstree('get_json', node);
			
			if (!nodeJson[0].children) {
				this.tree.jstree('delete_node', node);
			}
			nodeName = shorthand.treeData.getNodeName(shorthand.constants.TRANSFORM, {
				prefix: this.pre
			});
			
			node = jQuery('#' + nodeName);
			nodeJson = this.tree.jstree('get_json', node);
			
			if (!nodeJson[0].children) {
				this.tree.jstree('delete_node', node);
			}
		} else if (citizen instanceof hemi.Camera) {
			nodeName = shorthand.treeData.getNodeName(shorthand.constants.CAM_MOVE, {
				prefix: this.pre
			});
			
			node = jQuery('#' + nodeName);
			this.tree.jstree('delete_node', node);
		}
	};
	
	function updateTrigger(citizen) {
		if (citizen instanceof hemi.Shape) {
			var nodeName = shorthand.treeData.getNodeName(citizen, {
					prefix: this.pre
				}),
				type = citizen._octaneType.split('.').pop() + 'Type',
				node = shorthand.treeData.createTriggerJson(citizen, 
					this.pre);
			
			shorthand.treeData.createShapePickJson(citizen, node, this.pre);
			shorthand.treeData.createShapeTransformTriggerJson(citizen, node, this.pre);

			this.tree.jstree('delete_node', '#' + nodeName);				
			this.tree.jstree('create_node', '#' + this.pre + type, 'inside', {
				json_data: node
			});
		} else if (citizen instanceof hemi.Viewpoint) {
			// In future if we support multiple cameras, this will need to
			// be updated
			var cmc = shorthand.treeData.createCamMoveCitizen(editor.client.camera),
				nodeName = shorthand.treeData.getNodeName(citizen, {
					prefix: this.pre,
					parent: cmc
				});
			
			this.generateNodes(nodeName, false);
			this.tree.jstree('rename_node', '#' + nodeName, citizen.name);
		}
		
		// TODO: now update valuecheck behaviors to show the updated name
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
//                         		  			  Helper Methods		   	                          //
////////////////////////////////////////////////////////////////////////////////////////////////////

	function populateTree(tree) {
		var treeModel = shorthand.treeModel,
			table = treeModel.octaneTypes,
			keys = table.keys();
			
		treeModel.addListener(shorthand.events.CitizenAdded, tree);
		treeModel.addListener(shorthand.events.CitizenRemoved, tree);
		treeModel.addListener(shorthand.events.CitizenUpdated, tree);
			
		for (var i = 0, il = keys.length; i < il; i++) {
			var list = table.get(keys[i]);
			
			for (var j = 0, jl = list.length; j < jl; j++) {
				var cit = list[j],
					createType = j === 0;
				
				tree.notify(shorthand.events.CitizenAdded, {
					citizen: cit,
					createType: createType
				});
			}
		}
	};
	
	shorthand.treeModel = new TreeModel();
	
	shorthand.createCitizensTree = function() {
		var tree = new TreeView(CITIZEN_PREFIX);
		
		populateTree(tree);
		return tree;
	};
	
	shorthand.createActionsTree = function() {
		var tree = new TreeView(ACTION_PREFIX);
		
		populateTree(tree);
		return tree;
	};
	
	shorthand.createTriggersTree = function() {
		var tree = new TreeView(TRIGGER_PREFIX);
		
		populateTree(tree);
		return tree;
	};
	
})();
