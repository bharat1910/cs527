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
//                     			   			Initialization			  		                      //
////////////////////////////////////////////////////////////////////////////////////////////////////

	var shorthand = editor.tools.hud;

	shorthand.init = function() {
		var navPane = editor.ui.getNavPane('HUD'),

			hudMdl = new HudModel(),
			hudView = new HudView(),
			hudCtr = new HudController();

		hudCtr.setModel(hudMdl);
		hudCtr.setView(hudView);

		navPane.add(hudView);
	};

////////////////////////////////////////////////////////////////////////////////////////////////////
//                     			  			Tool Definition			  		                      //
////////////////////////////////////////////////////////////////////////////////////////////////////

	shorthand.events = {
		// model specific
		ElementCreated: "Hud.ElementCreated",
		ElementRemoved: "Hud.ElementRemoved",
		ElementSet: "Hud.ElementSet",
		ElementUpdated: "Hud.ElementUpdated",
		PageCreated: "Hud.PageCreated",
		PageRemoved: "Hud.PageRemoved",
		PageSet: "Hud.PageSet",

		// hud edit specific
		CreateDisplay: "Hud.CreateDisplay",
		CreatePage: "Hud.CreatePage",
		RemoveElement: "Hud.RemoveElement",
		RemovePage: "Hud.RemovePage",
		SaveElement: "Hud.SaveElement",
		SavePage: "Hud.SavePage",

		// hud tree specific
		SelectHudNode: "Hud.SelectHudNode",

		// shared
		SetElement: "Hud.SetElement"
	};

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                   			 Model                                    		  //
////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * A HudModel handles the creation, updating, and removal of heads-up displays.
	 */
	var HudModel = function() {
		editor.ToolModel.call(this, 'hud');

		this.currentDisplay = null;
		this.currentPage = null;
		this.currentElement = null;
		this.theme = null;
	};

	HudModel.prototype = new editor.ToolModel();
	HudModel.prototype.constructor = HudModel;

	HudModel.prototype.createDisplay = function(name) {
		var display = new hemi.HudDisplay(editor.client);
		display.name = name;
		this.notifyListeners(editor.events.Created, display);
		this.setDisplay(display);
	};

	HudModel.prototype.createPage = function(opt_select) {
		var page = new hemi.HudPage(),
			display = this.currentDisplay;

		display.add(page);
		page.name = display.name + ' Page ' + display.getNumberOfPages();
		this.notifyListeners(shorthand.events.PageCreated, page);

		if (opt_select) {
			this.setPage(page);
		}
	};

	HudModel.prototype.removeDisplay = function(display) {
		if (display === this.currentDisplay) {
			this.setDisplay(null);
		}

		this.notifyListeners(editor.events.Removing, display);
		display.cleanup();
	};

	HudModel.prototype.removeElement = function(element) {
		this.currentPage.remove(element);
		element.cleanup();
		this.currentDisplay.show();
		this.notifyListeners(shorthand.events.ElementRemoved, element);
	};

	HudModel.prototype.removePage = function(page) {
		this.currentDisplay.remove(page);
		page.cleanup();
		this.notifyListeners(shorthand.events.PageRemoved, page);
	};

	HudModel.prototype.saveElement = function(props) {
		var element = this.currentElement,
			event = shorthand.events.ElementCreated,
			refresh = true,
			that = this;

		if (props.type === 'Text') {
			if (element !== null) {
				if (element instanceof hemi.HudText) {
					event = shorthand.events.ElementUpdated;
				} else {
					this.currentPage.remove(element);
					element.cleanup();
					element = null;
				}
			}

			if (element === null) {
				element = new hemi.HudText();
				this.currentPage.add(element);
				element.name = this.currentPage.name + ' Text ' + this.currentPage.elements.length;
			}

			element.x = props.x;
			element.y = props.y;
            if (props.percentX != null && props.percentY != null) {
                element.percentX = props.percentX;
                element.percentY = props.percentY;
                element.x = (props.percentX / 100) * window.screen.width;
                element.y = (props.percentY / 100) * window.screen.height;
            }
			element.setConfig(props.config);
			element.setText(props.text);
			element.setWidth(props.width);
		} else if (props.type === 'Image') {
			if (element !== null) {
				if (element instanceof hemi.HudImage) {
					event = shorthand.events.ElementUpdated;
				} else {
					this.currentPage.remove(element);
					element.cleanup();
					element = null;
				}
			}

			if (element === null) {
				element = new hemi.HudImage();
				this.currentPage.add(element);
				element.name = this.currentPage.name + ' Image ' + this.currentPage.elements.length;
			}

			element.x = props.x;
			element.y = props.y;
			element.setUrl(props.url, function(hudImage) {
					that.currentDisplay.show();
				});
			refresh = false;
		}

		if (element !== null) {
			this.notifyListeners(event, element);
		}

		this.setElement(null);

		if (refresh) {
			this.currentDisplay.show();
		}
	};

	HudModel.prototype.savePage = function(props) {
		this.currentPage.config = props;

		if (this.currentDisplay._visible) {
			this.currentDisplay.showPage();
		}
	};

	HudModel.prototype.setDisplay = function(display) {
		if (this.currentDisplay !== null) {
			this.currentDisplay.hide();
		}

		if (display === null) {
			this.currentPage = null;
			this.currentElement = null;
		} else if (display.getNumberOfPages() > 0) {
			display.show();
		}

		this.currentDisplay = display;
		this.notifyListeners(editor.events.Editing, display);
	};

	HudModel.prototype.setElement = function(element) {			
		this.currentElement = element;
		this.notifyListeners(shorthand.events.ElementSet, element);
	};

	HudModel.prototype.setPage = function(page) {
		var hide = true;

		if (page !== null) {
			var pages = this.currentDisplay.pages;

			for (var i = 0, il = pages.length; hide && i < il; ++i) {
				if (pages[i] === page) {
					this.currentDisplay.currentPage = i;
					this.currentDisplay.showPage();
					hide = false;
				}
			}
		}

		if (hide) {
			this.currentDisplay.hide();
		}

		this.currentPage = page;
		this.notifyListeners(shorthand.events.PageSet, page);
	};

	HudModel.prototype.worldCleaned = function() {
		var displays = hemi.world.getHudDisplays();

		for (var i = 0, il = displays.length; i < il; ++i) {
			this.notifyListeners(editor.events.Removing, displays[i]);
		}
	};

	HudModel.prototype.worldLoaded = function() {
		var displays = hemi.world.getHudDisplays();
		for (var i = 0, il = displays.length; i < il; ++i) {
			this.notifyListeners(editor.events.Created, displays[i]);
		}
	};

////////////////////////////////////////////////////////////////////////////////////////////////////
//										Hud Tree Sidebar Widget									  //
////////////////////////////////////////////////////////////////////////////////////////////////////

	var TREE_PREFIX = 'hud',

		treeWgtSuper = editor.ui.Widget.prototype,
	
		TreeWidget = function() {
			editor.ui.Widget.call(this, {
				name: 'hudTreeWidget'
			});
		};

	TreeWidget.prototype = new editor.ui.Widget();
	TreeWidget.prototype.constructor = TreeWidget;

	TreeWidget.prototype.add = function(obj, parentObj) {
		var parentNode = parentObj === undefined ? -1 : this.getNode(parentObj),
			objJson = createJson(obj);

		this.tree.jstree('create_node', parentNode, 'inside', {
			json_data: objJson
		});
	};

	TreeWidget.prototype.getNode = function(obj) {
		return jQuery('#' + getNodeName(obj));
	};

	TreeWidget.prototype.layout = function() {
		treeWgtSuper.layout.call(this);

		this.tree = jQuery('<div id="hudTree"></div>');
		this.title = jQuery('<h1>Hud Outline</h1>');
		this.instructions = jQuery("<p>Type in a name and click 'Create New Display' to add a new HUD display box</p>");
		this.form = jQuery('<form method="post"></form>');
		this.nameInput = jQuery('<input type="text" id="hudDpyName" />');
		this.createBtn = jQuery('<button id="createHudDisplay" class="inlineBtn">Create New Display</button>');
		var wgt = this;

		this.createBtn.bind('click', function(evt) {
			var name = wgt.nameInput.val();
			wgt.notifyListeners(shorthand.events.CreateDisplay, name);
			wgt.createBtn.attr('disabled', 'disabled');
			wgt.nameInput.val('');
		})
		.attr('disabled', 'disabled');

		this.nameInput.bind('keyup', function(evt) {
			var val = jQuery(this).val();

			if (val !== '') {
				wgt.createBtn.removeAttr('disabled');
			} else {
				wgt.createBtn.attr('disabled', 'disabled');
			}
		});

		this.form.append(this.nameInput).append(this.createBtn)
			.bind('submit', function(evt) {
				return false;
			});
		this.container.append(this.title).append(this.instructions)
			.append(this.form).append(this.tree);

		this.tree.bind('select_node.jstree', function(evt, data) {
			var elem = data.rslt.obj;
			wgt.tree.jstree('open_node', elem);

			if (data.args[2] != null) {
				var path = wgt.tree.jstree('get_path', elem, true),
					hudObjs = [];

				for (var i = 0, il = path.length; i < il; ++i) {
					hudObjs.push(jQuery('#' + path[i]).data('jstree'));
				}

				wgt.notifyListeners(shorthand.events.SelectHudNode, hudObjs);
			}
		}).jstree({
			'json_data': {
				'data': {},
				'progressive_render': true
			},
			'types': {
				'types': {
					'display': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-96px 0'
						}
					},
					'page': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-112px 0'
						}
					},
					'text': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-64px 0'
						}
					},
					'image': {
						'icon': {
							'image': 'images/treeSprite.png',
							'position': '-128px 0'
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

	TreeWidget.prototype.remove = function(obj) {
		var node = this.getNode(obj);
		this.tree.jstree('delete_node', node);
	};

	TreeWidget.prototype.select = function(obj) {
		this.tree.jstree('deselect_all');

		if (obj) {
			this.tree.jstree('select_node', this.getNode(obj));
		}
	};

	TreeWidget.prototype.update = function(obj) {
		var node = this.getNode(obj);
		this.tree.jstree('rename_node', node, obj.name);
	};

	function createJson(obj) {
		var json = null;

		if (obj.data && obj.attr) {
			json = obj;
		} else {
			var id = getNodeName(obj),
				name = obj.name,
				type = obj._octaneType.split('.').pop().toLowerCase().replace('hud', ''),
				leaf = false,
				children = [];

			switch (type) {
				case 'display':
					var pages = obj.pages;

					for (var i = 0, il = pages.length; i < il; ++i) {
						children.push(createJson(pages[i]));
					}
					break;
				case 'page':
					var elems = obj.elements;

					for (var i = 0, il = elems.length; i < il; ++i) {
						children.push(createJson(elems[i]));
					}
					break;
				default:
					leaf = true;
					break;
			}

			json = {
				data: name,
				attr: {
					id: id,
					rel: type
				},
				state: leaf ? 'leaf' : 'closed',
				children: children,
				metadata: obj
			};
		}

		return json;
	}

	function getNodeName(obj) {
		var nodeName = null;

		if (obj !== null) {
			nodeName = TREE_PREFIX + obj._octaneType.split('.').pop();				
			nodeName += '_' + (obj._getId ? obj._getId() : obj.name);
			nodeName = nodeName.replace(/\s/g, '_').replace(/\./g, '_');
		}

		return nodeName;
	}

////////////////////////////////////////////////////////////////////////////////////////////////////
//									Create Hud Sidebar Widget									  //
////////////////////////////////////////////////////////////////////////////////////////////////////

	var crtWgtSuper = editor.ui.FormWidget.prototype,

		CreateWidget = function() {
			editor.ui.FormWidget.call(this, {
				name: 'createHudWidget',
				uiFile: 'js/editor/plugins/hud/html/displaysForms.htm'
			});	
		};

	CreateWidget.prototype = new editor.ui.FormWidget();
	CreateWidget.prototype.constructor = TreeWidget;

	CreateWidget.prototype.bindDisplayEditor = function() {
		var addPageBtn = this.displayEditor.find('#hudDpyAddPageBtn'),
			removeBtn = this.displayEditor.find('#hudDpyRemoveBtn'),
			wgt = this;

		addPageBtn.bind('click', function(evt) {
			wgt.notifyListeners(shorthand.events.CreatePage, true);
		});

		removeBtn.bind('click', function(evt) {
			var display = wgt.displayEditor.data('obj');

			if (editor.depends.check(display)) {
				wgt.notifyListeners(editor.events.Remove, display);
			}
		});
	};

	CreateWidget.prototype.bindImageEditor = function() {
		var imgEdt = this.imageEditor,
			inputs = imgEdt.find('input'),
			saveBtn = imgEdt.find('#hudImgSaveBtn'),
			cancelBtn = imgEdt.find('#hudImgCancelBtn'),
			removeBtn = imgEdt.find('#hudImgRemoveBtn'),
			wgt = this;

		this.urlInput = new editor.ui.Input({
			container: imgEdt.find('#hudImgUrl'),
			type: 'string'
		});
        var children = imgEdt.find('#hudImgPercentPositionDiv').children();
       
        for (var i = 0; i < children.length; i++) {
            jQuery(children[i]).bind('blur', function() {
                var percentPos = wgt.percentImagePosition.getValue();
                if (percentPos) {
                    var x = (percentPos[0]/100) * window.screen.width,
                        y = (percentPos[1]/100) * window.screen.height;
                    wgt.textPosition.setValue([x , y]);
                }
            });
        }

		inputs.bind('blur', function(evt) {
			wgt.canSave(inputs, [saveBtn]);
		})
		.bind('change', function(evt) {
			wgt.canSave(inputs, [saveBtn]);
		});

		saveBtn.bind('click', function(evt) {
			var pos = wgt.imagePosition.getValue(),
                percentPos = wgt.percentImagePosition.getValue(),
				props = {
					type: 'Image',
                    x: pos[0],
                    y: pos[1],
					percentX: percentPos != null ? percentPos[0] : null,
					percentY: percentPos != null ? percentPos[1] : null,
					url: wgt.urlInput.getValue()
				};

			wgt.setImageEditor(null);
			wgt.notifyListeners(shorthand.events.SaveElement, props);
		});

		cancelBtn.bind('click', function(evt) {
			imgEdt.hide();
			wgt.pageEditor.show();
			wgt.preferredHeight = wgt.pageEditor.height();
			imgEdt.find('input.error').removeClass('error');
		});

		removeBtn.bind('click', function(evt) {
			var image = imgEdt.data('obj');
			wgt.notifyListeners(shorthand.events.RemoveElement, image);
		}).hide();
	};

	CreateWidget.prototype.bindPageEditor = function() {
		var pgeEdt = this.pageEditor,
			addTextBtn = pgeEdt.find('#hudPgeAddTextBtn'),
			addImageBtn = pgeEdt.find('#hudPgeAddImageBtn'),
			removeBtn = pgeEdt.find('#hudPgeRemoveBtn'),
			saveBtn = pgeEdt.find('#hudPgeSaveBtn'),
			cancelBtn = pgeEdt.find('#hudPgeCancelBtn'),
			wgt = this;

		var colorPicker = new editor.ui.ColorPicker({
			inputId: 'hudPgeColor',
			buttonId: 'hudPgeColorPicker'
		});

		this.find('#hudPgeColorLbl').after(colorPicker.getUI());

		colorPicker.addListener(editor.events.ColorPicked, function(clr) {		
			saveBtn.removeAttr('disabled');
			cancelBtn.removeAttr('disabled');
		});

		pgeEdt.data('colorPicker', colorPicker);

		addTextBtn.bind('click', function(evt) {
			wgt.notifyListeners(shorthand.events.SetElement, null);
			wgt.setTextEditor(null);
			wgt.preferredHeight = wgt.textEditor.height();
		});

		addImageBtn.bind('click', function(evt) {
			wgt.notifyListeners(shorthand.events.SetElement, null);
			wgt.setImageEditor(null);
			wgt.preferredHeight = wgt.imageEditor.height();
		});

		removeBtn.bind('click', function(evt) {
			var page = pgeEdt.data('obj');
			wgt.notifyListeners(shorthand.events.RemovePage, page);
		});

		saveBtn.bind('click', function(evt) {				
			var props = {
				color: colorPicker.getColor()
			};

			wgt.notifyListeners(shorthand.events.SavePage, props);
			saveBtn.attr('disabled', 'disabled');
			cancelBtn.attr('disabled', 'disabled');
		});

		cancelBtn.bind('click', function(evt) {
			var color = pgeEdt.data('oldColor');

			colorPicker.setColor(color);
			cancelBtn.attr('disabled', 'disabled');
			saveBtn.attr('disabled', 'disabled');
		})
		.attr('disabled', 'disabled');
	};

	CreateWidget.prototype.bindTextEditor = function(validator) {
		var txtEdt = this.textEditor,
			inputs = txtEdt.find('input'),
			required = txtEdt.find('input:not(.optional)'),
			textInput = txtEdt.find('#hudTxtText'),
			fontSelect = txtEdt.find('#hudTxtFont'),
			styleSelect = txtEdt.find('#hudTxtStyle'),
			alignSelect = txtEdt.find('#hudTxtAlign'),
			saveBtn = txtEdt.find('#hudTxtSaveBtn'),
			cancelBtn = txtEdt.find('#hudTxtCancelBtn'),
			removeBtn = txtEdt.find('#hudTxtRemoveBtn'),
			colorPicker = new editor.ui.ColorPicker({
				inputId: 'hudTxtColor',
				buttonId: 'hudTxtColorPicker'
			}),
			wgt = this;

        var children = txtEdt.find('#hudTxtPercentPositionDiv').children();
       
        for (var i = 0; i < children.length; i++) {
            jQuery(children[i]).bind('blur', function() {
                var percentPos = wgt.percentTextPosition.getValue();
                if (percentPos) {
                    var x = (percentPos[0]/100) * window.screen.width,
                        y = (percentPos[1]/100) * window.screen.height;
                    wgt.textPosition.setValue([x , y]);
                }
            });
        }

		this.sizeInput = new editor.ui.Input({
			container: txtEdt.find('#hudTxtSize'),
			type: 'integer',
			validator: validator
		});
		this.widthInput = new editor.ui.Input({
			container: txtEdt.find('#hudTxtWidth'),
			validator: validator
		});
		this.find('#hudTxtColorLbl').after(colorPicker.getUI());

		txtEdt.data('colorPicker', colorPicker);

		inputs.bind('blur', function(evt) {
			wgt.canSave(required, [saveBtn]);
		})
		.bind('change', function(evt) {
			wgt.canSave(required, [saveBtn]);
		});

		saveBtn.bind('click', function(evt) {
			var size = wgt.sizeInput.getValue(),
				font = fontSelect.val(),
				style = styleSelect.val(),
				align = alignSelect.val(),
				color = colorPicker.getColor(),
				pos = wgt.textPosition.getValue(),
                percentPos = wgt.percentTextPosition.getValue();

			var props = {
				type: 'Text',
				x: pos[0],
				y: pos[1],
                percentX: percentPos != null ? percentPos[0] : null,
                percentY: percentPos != null ? percentPos[1] : null,
				text: textInput.val(),
				width: wgt.widthInput.getValue(),
				config: {}
			};

			if (color !== null) {
				props.config.color = color;
			}
			if (size !== null) {
				props.config.textSize = size;
			}
			if (font !== '-1') {
				props.config.textTypeface = font;
			}
			if (style !== '-1') {
				props.config.textStyle = style;
			}
			if (align !== '-1') {
				props.config.textAlign = align;
			}

			colorPicker.setColor([1, 1, 1, 1]);
			wgt.setTextEditor(null);
			wgt.notifyListeners(shorthand.events.SaveElement, props);
		});

		cancelBtn.bind('click', function(evt) {
			txtEdt.hide();
			wgt.pageEditor.show();
			wgt.preferredHeight = wgt.pageEditor.height();
			txtEdt.find('input.error').removeClass('error');
		});

		removeBtn.bind('click', function(evt) {
			var text = txtEdt.data('obj');
			
			wgt.notifyListeners(shorthand.events.RemoveElement, text);
		})
		.hide();
	};

	CreateWidget.prototype.canSave = function(inputs, btns) {
		var	canSave = true;

		for (var i = 0, il = inputs.length; canSave && i < il; ++i) {
			canSave = inputs[i].value !== '';
		}

		if (canSave) {
			for (var i = 0, il = btns.length; i < il; ++i) {
				btns[i].removeAttr('disabled');
			}
		} else {
			for (var i = 0, il = btns.length; i < il; ++i) {
				btns[i].attr('disabled', 'disabled');
			}
		}
	};

	CreateWidget.prototype.edit = function(obj) {
		if (obj) {
			var type = obj._octaneType.split('.').pop();

			// now setup the appropriate editor
			switch (type) {
				case 'HudDisplay':
					this.setDisplayEditor(obj);
					this.preferredHeight = this.displayEditor.height();
					break;
				case 'HudPage':
					this.setPageEditor(obj);
					this.preferredHeight = this.pageEditor.height();
					break;
				case 'HudText':
					this.setTextEditor(obj);
					this.preferredHeight = this.textEditor.height();
					break;
				case 'HudImage':
					this.setImageEditor(obj);
					this.preferredHeight = this.imageEditor.height();
					break;
			}
		} else {
			this.reset();
		}
	};

	CreateWidget.prototype.layout = function() {
		crtWgtSuper.layout.call(this);

		var wgt = this,
			validator = editor.ui.createDefaultValidator();

		this.displayEditor = this.find('#hudDpyEditor');
		this.pageEditor = this.find('#hudPgeEditor');
		this.textEditor = this.find('#hudTxtEditor');
		this.textPosition = new editor.ui.Vector({
			container: wgt.find('#hudTxtPositionDiv'),
			inputs: ['x', 'y'],
			validator: validator
		});
        this.percentTextPosition = new editor.ui.Vector({
            container: wgt.find('#hudTxtPercentPositionDiv'),
            inputs: ['px', 'py'],
            type: "optional vector",
            validator: validator
        });
		this.imageEditor = this.find('#hudImgEditor');
		this.imagePosition = new editor.ui.Vector({
			container: wgt.find('#hudImgPositionDiv'),
			inputs: ['x', 'y'],
			validator: validator
		});
        this.percentImagePosition = new editor.ui.Vector({
            container: wgt.find('#hudImgPercentPositionDiv'),
            inputs: ['px', 'py'],
            type: "optional vector",
            validator: validator
        });

		this.bindDisplayEditor();
		this.bindPageEditor();
		this.bindTextEditor(validator);
		this.bindImageEditor();

		this.find('form').bind('submit', function(evt) {
			return false;
		});

		// hide all
		this.reset();
	};

	CreateWidget.prototype.reset = function() {
		this.imageEditor.hide();
		this.pageEditor.hide();
		this.textEditor.hide();
		this.displayEditor.hide();
	};

	CreateWidget.prototype.setDisplayEditor = function(obj) {
		this.reset();
		this.displayEditor.data('obj', obj).find('.displayName').text(obj.name);
		this.displayEditor.show();
	};

	CreateWidget.prototype.setPageEditor = function(obj) {
		var pgeEdt = this.pageEditor,
			colorPicker = pgeEdt.data('colorPicker'),
			color = obj && obj.config.color ? obj.config.color : hemi.getHudTheme().page.color;

		this.reset();
		pgeEdt.data('obj', obj).data('oldColor', color)
			.find('.displayName').text(obj.name);

		colorPicker.setColor(color);
		pgeEdt.show();
	};

	CreateWidget.prototype.setImageEditor = function(obj) {
		var imgEdt = this.imageEditor,
			removeBtn = imgEdt.find('#hudImgRemoveBtn');

		this.reset();
		imgEdt.data('obj', obj).find('.displayName').text(obj ? obj.name : '');
        if (obj) {
            if (obj.percentX === null || obj.percentY === null) {
                this.imagePosition.setValue([obj.x, obj.y]);
            } else {
                var x = (obj.percentX / 100) * window.screen.width,
                    y = (obj.percentY / 100) * window.screen.height;
                this.percentImagePosition.setValue([obj.percentX, obj.percentY]);
                this.imagePosition.setValue([x, y]);
            }
        } else {
            this.imagePosition.reset();
        }

		this.urlInput.setValue(obj ? obj.url : null);

		if (obj) {
			removeBtn.show();
		} else {
			removeBtn.hide();
		}

		imgEdt.show();
	};

	CreateWidget.prototype.setTextEditor = function(obj) {
		var textTheme = hemi.getHudTheme().text,
			txtEdt = this.textEditor,
			required = txtEdt.find('input:not(.optional)'),
			textInput = txtEdt.find('#hudTxtText'),
			fontSelect = txtEdt.find('#hudTxtFont'),
			styleSelect = txtEdt.find('#hudTxtStyle'),
			alignSelect = txtEdt.find('#hudTxtAlign'),
			removeBtn = txtEdt.find('#hudTxtRemoveBtn'),
			colorPicker = txtEdt.data('colorPicker'),
			color = obj && obj.config.color ? obj.config.color : textTheme.color;
		this.reset();
		txtEdt.data('obj', obj).find('.displayName').text(obj ? obj.name : '');

        if (obj) {
            if (obj.percentX === null || obj.percentY === null) {
                this.textPosition.setValue([obj.x, obj.y]);
            } else {
                var x = (obj.percentX / 100) * window.screen.width,
                    y = (obj.percentY / 100) * window.screen.height;
                this.percentTextPosition.setValue([obj.percentX, obj.percentY]);
                this.textPosition.setValue([x, y]);
            }
        } else {
            this.textPosition.reset();
        }

		this.widthInput.setValue(obj ? obj._width : null);
		textInput.val(obj ? obj._text[0] : '');
		this.sizeInput.setValue(obj && obj.config.textSize ? obj.config.textSize : textTheme.textSize);
		fontSelect.val(obj && obj.config.textTypeface ? obj.config.textTypeface : textTheme.textTypeface);
		styleSelect.val(obj && obj.config.textStyle ? obj.config.textStyle : textTheme.textStyle);
		alignSelect.val(obj && obj.config.textAlign ? obj.config.textAlign : textTheme.textAlign);

		colorPicker.setColor(color);

		if (obj) {
			removeBtn.show();		
		} else {
			removeBtn.hide();		
		}

		this.canSave(required, [txtEdt.find('#hudTxtSaveBtn')]);
		txtEdt.show();
	};

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                  			View		                                      //
////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * The HudView controls the widgets for the Hud tool.
	 */
	var HudView = function() {
		editor.ToolView.call(this, {
			toolName: 'Heads-Up Displays',
			toolTip: 'Create and edit heads-up displays',
			id: 'hud'
		});

		this.addPanel(new editor.ui.Panel({
			classes: ['hudSidePanel']
		}));

		this.sidePanel.addWidget(new CreateWidget());
		this.sidePanel.addWidget(new TreeWidget());
	};

	HudView.prototype = new editor.ToolView();
	HudView.prototype.constructor = HudView;

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                			  Controller		                                  //
////////////////////////////////////////////////////////////////////////////////////////////////////

	var hudCtrSuper = editor.ToolController.prototype,

		/**
		 * The HudController facilitates HudModel and HudView communication by binding event and
		 * message handlers.
		 */
		HudController = function() {
			editor.ToolController.call(this);
		};

	HudController.prototype = new editor.ToolController();
	HudController.prototype.constructor = HudController;

	/**
	 * Binds event and message handlers to the view and model this object references.  
	 */
	HudController.prototype.bindEvents = function() {
		hudCtrSuper.bindEvents.call(this);

		var model = this.model,
			view = this.view,
			treeWgt = view.sidePanel.hudTreeWidget,
			crtWgt = view.sidePanel.createHudWidget;

		// special listener for when the toolbar button is clicked
		view.addListener(editor.events.ToolModeSet, function(value) {
			if (model.currentDisplay) {
				var isDown = value.newMode === editor.ToolConstants.MODE_DOWN;

				if (isDown) {
					model.currentDisplay.currentPage = model.savedPage ? model.savedPage : 0;
					model.currentDisplay.show();
				} else {
					model.savedPage = model.currentDisplay.currentPage;
					model.currentDisplay.hide();
				}
			}
		});

		// hud tree specific listeners
		treeWgt.addListener(shorthand.events.CreateDisplay, function(name) {
			model.createDisplay(name);
		});
		treeWgt.addListener(shorthand.events.SelectHudNode, function(hudObjs) {
			for (var i = 0, il = hudObjs.length; i < il; ++i) {
				var hudObj = hudObjs[i],
					type = hudObj._octaneType.split('.').pop();

				switch (type) {
					case 'HudDisplay':
						model.setDisplay(hudObj);
						break;
					case 'HudPage':
						model.setPage(hudObj);
						break;
					case 'HudText':
					case 'HudImage':
						model.setElement(hudObj);
						break;
				}
			}
		});

		// hud edit specific listeners
		crtWgt.addListener(shorthand.events.CreatePage, function(select) {
			model.createPage(select);
		});
		crtWgt.addListener(editor.events.Remove, function(display) {
			model.removeDisplay(display);
		});
		crtWgt.addListener(shorthand.events.RemoveElement, function(element) {
			model.removeElement(element);
		});
		crtWgt.addListener(shorthand.events.RemovePage, function(page) {
			model.removePage(page);
		});
		crtWgt.addListener(shorthand.events.SaveElement, function(props) {
			model.saveElement(props);
		});
		crtWgt.addListener(shorthand.events.SavePage, function(props) {
			model.savePage(props);
		});
		crtWgt.addListener(shorthand.events.SetElement, function(element) {
			model.setElement(element);
		});

		// model specific listeners
		model.addListener(editor.events.Created, function(display) {
			treeWgt.add(display);
		});
		model.addListener(editor.events.Editing, function(display) {
			crtWgt.edit(display);
			treeWgt.select(display);
		});
		model.addListener(editor.events.Removing, function(display) {
			treeWgt.remove(display);
		});
		model.addListener(shorthand.events.ElementCreated, function(element) {
			treeWgt.add(element, model.currentPage);
		});
		model.addListener(shorthand.events.ElementRemoved, function(element) {
			crtWgt.edit(model.currentPage);
			treeWgt.remove(element);
			treeWgt.select(model.currentPage);
		});
		model.addListener(shorthand.events.ElementSet, function(element) {
			if (element) {
				crtWgt.edit(element);
				treeWgt.select(element);
			} else {
				crtWgt.edit(model.currentPage);
				treeWgt.select(model.currentPage);
			}
		});
		model.addListener(shorthand.events.ElementUpdated, function(element) {
			crtWgt.edit(model.currentPage);
			treeWgt.select(model.currentPage);
			treeWgt.update(element);
		});
		model.addListener(shorthand.events.PageCreated, function(page) {
			treeWgt.add(page, model.currentDisplay);
		});
		model.addListener(shorthand.events.PageRemoved, function(page) {
			crtWgt.edit(model.currentDisplay);
			treeWgt.remove(page);
			treeWgt.select(model.currentDisplay);
		});
		model.addListener(shorthand.events.PageSet, function(page) {
			crtWgt.edit(page);
			treeWgt.select(page);
		});
	};

////////////////////////////////////////////////////////////////////////////////////////////////////
//											Extra Scripts										  //
////////////////////////////////////////////////////////////////////////////////////////////////////
	editor.getCss('js/editor/plugins/hud/css/style.css');

})();
