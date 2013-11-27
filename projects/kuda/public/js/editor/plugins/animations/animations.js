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
	
////////////////////////////////////////////////////////////////////////////////
//                     			   Initialization  		                      //
////////////////////////////////////////////////////////////////////////////////

	var shorthand = editor.tools.animations;

	shorthand.init = function() {
		var navPane = editor.ui.getNavPane('Animation'),
			
			anmMdl = new AnimatorModel(),
			anmView = new AnimatorView(),
			anmCtr = new AnimatorController();
						
		anmCtr.setModel(anmMdl);
		anmCtr.setView(anmView);
		
		navPane.add(anmView);
	};
////////////////////////////////////////////////////////////////////////////////
//                     			  Tool Definition  		                      //
////////////////////////////////////////////////////////////////////////////////
	
	shorthand.events = {
		// model events
		AnimationStopped: "animator.AnimationStopped",
		LoopRemoved: "animator.LoopRemoved",
		ModelPicked: "animator.ModelPicked",
		
		// create animation widget events
		ModelSelected: "crtAnm.ModelSelected",
		RemoveAnmLoop: "crtAnm.RemoveAnmLoop",
		StartPreview: "crtAnm.StartPreview",
		StopPreview: "crtAnm.StopPreview",
		AddAnmLoop: "crtAnm.AddAnmLoop",
		EditAnmLoop: "crtAnm.EditAnmLoop",
		SaveAnimation: "crtAnm.SaveAnimation",
		SetAnmBeginFrame: "crtAnm.SetAnmBeginFrame",
		SetAnmEndFrame: "crtAnm.SetAnmEndFrame",
		SetAnmName: "crtAnm.SetAnmName",
		
		// animation list events
		CreateAnimation: "anmList.CreateAnimation",

        // Cleanup event for widget
        CleanUpWidget: "anmList.CleanUpWidget"
	};
	
////////////////////////////////////////////////////////////////////////////////
//                                   Model                                    //
////////////////////////////////////////////////////////////////////////////////
	
	/**
	 * An AnimatorModel handles the creation and playing of animations as well
	 * as model picking for the animation tool.
	 */
	var AnimatorModel = function() {
		editor.ToolModel.call(this, 'animations');
		
		this.selectedModel;
		this.hilights = new Hashtable();
		this.hilightMaterial;
		this.animation = null;
		this.animDirty = false;
		this.msgHandler = null;
		this.name = 'No Name';
		this.isUpdate = false;

		var that = this;
		
		hemi.subscribe(hemi.msg.stop,
			function(msg) {
				if (that.animation && msg.src === that.animation) {
					that.notifyListeners(shorthand.events.AnimationStopped, 
						that.animation);
				}
			});
	};
	
	AnimatorModel.prototype = new editor.ToolModel();
	AnimatorModel.prototype.constructor = AnimatorModel;
	/**
	 * Creates an animation object
	 */
	AnimatorModel.prototype.createAnimation = function() {	        
		if (!this.animation) {			
			this.animation = new hemi.AnimationGroup(this.startTime, this.endTime, this.selectedModel);
			this.animation.name = this.name;
			this.animation.reset();
			this.animDirty = true;
		}   
		else if (this.startTime != null && this.endTime != null) {				
			this.stopAnimation();
			this.animation.beginTime = this.startTime;
			this.animation.endTime = this.endTime;
			this.animation.reset();
			this.animation.name = this.name;
		} 
	};
	
	/**
	 * Creates an animation loop and adds it to the current animation 
	 * object.  If no animation object exists, this  returns false, true
	 * otherwise.
	 * 
	 * @param {number} start the starting keyframe for the loop 
	 * @param {number} end the end keyframe for the loop
	 * @param {number} iterations the number of iterations to loop over.  
	 *        Specify a -1 if looping infinitely.
	 *        
	 * @return {boolean} true if the loop was created, false otherwise.
	 */
	AnimatorModel.prototype.createLoop = function(start, end, iterations) {			
		if (!this.animation) {
			this.createAnimation();
		}

		var loop = new hemi.Loop();
		loop.startTime = hemi.getTimeOfFrame(start);
		loop.stopTime = hemi.getTimeOfFrame(end);
		loop.iterations = iterations;
		
		this.stopAnimation();
		this.animation.addLoop(loop);
	
		return loop;
	};
	
	/**
	 * Enables or disables pick message handling
	 * 
	 * @param {boolean} enable flag that enables pick handling if true, 
	 *        disables otherwise.
	 */
	AnimatorModel.prototype.enableModelPicking = function(enable) {
		this.enable = enable;
		
		if (this.msgHandler !== null) {
			hemi.world.unsubscribe(this.msgHandler, hemi.msg.pick);
			this.msgHandler = null;
		}
		
		if (enable) {	            
			if (this.selectedModel) {
//	                this.hilightShapes();
			}
		}
		else {
			this.removeHilights();
		}
	};

	/**
	 * Highlights all shapes in the selected model.
	 * 
	 * TODO: Highlights cause performance problems. Try shader manipulation
	 * instead.
	 */
	AnimatorModel.prototype.hilightShapes = function() {
		var transforms = this.selectedModel.transforms;
		
		for (var ndx = 0, len = transforms.length; ndx < len; ndx++) {
			// make a copy of the selected shape so we can use it to hilight.
			var transform = transforms[ndx];
			var shapes = transform.shapes;
			var hilightedShapes = [];
			
			for (var sndx = 0, slen = shapes.length; sndx < slen; sndx++) {
				var hilightShape = hemi.core.shape.duplicateShape(
					hemi.core.mainPack, shapes[sndx], 'hilight_');
				
				// Set all of it's elements to use the hilight material.
				var elements = hilightShape.elements;
				
				for (var ee = 0; ee < elements.length; ee++) {
					elements[ee].material = this.hilightMaterial;
				}
				
				// Add it to the same transform
				transform.addShape(hilightShape);
				hilightedShapes.push(hilightShape);
			}
			
			this.hilights.put(transform, hilightedShapes);
		}
	};

	/**
	 * Starts an animation for preview purposes.
	 */
	AnimatorModel.prototype.previewAnimation = function() {
		this.createAnimation();

		this.animation.start();	                   
	}; 
	
	AnimatorModel.prototype.removeAnimation = function(animation) {
		this.notifyListeners(editor.events.Removing, animation);
		animation.cleanup();
	};
	
	/**
	 * Removes highlight shapes from the selected model.
	 */
	AnimatorModel.prototype.removeHilights = function() {
		if (this.selectedModel) {
			var transforms = this.hilights.keys();
			
			for (var ndx = 0, len = transforms.length; ndx < len; ndx++) {
				var transform = transforms[ndx];
				var shapes = this.hilights.get(transform);
				
				for (var ndx2 = 0, len2 = shapes.length; ndx2 < len2; ndx2++) {
					var shape = shapes[ndx2];
					// Remove it from the transform of the selected object.
					transform.removeShape(shape);
					// Remove everything related to it.
					hemi.core.shape.deleteDuplicateShape(shape, 
						hemi.core.mainPack);
				}
			}
			
			this.hilights.clear();
		}
	};
	
	/**
	 * Removes the given loop.
	 * 
	 * @param {hemi.Loop} loop the loop to remove.
	 */
	AnimatorModel.prototype.removeLoop = function(loop) {
		if (this.animation) {
			this.stopAnimation();
			this.animation.removeLoop(loop);
			this.notifyListeners(shorthand.events.LoopRemoved, loop);
		}
	};
	
	AnimatorModel.prototype.saveAnimation = function() {
		var retVal = null,
			msgType = this.isUpdate ? editor.events.Updated
				: editor.events.Created;
		
		this.createAnimation();
		
		retVal = this.animation;
		
		this.stopAnimation();
		this.notifyListeners(msgType, this.animation);
		
		this.animation = null;
		this.animDirty = this.isUpdate = false;	
		this.startTime = this.endTime = null;
		this.name = 'No Name';
		
		return retVal;
	};
	
	AnimatorModel.prototype.saveLoop = function(loop, start, end, iterations) {
		this.stopAnimation();
		
		loop.startTime = hemi.getTimeOfFrame(start);
		loop.stopTime = hemi.getTimeOfFrame(end);
		loop.iterations = iterations;
		loop.current = 0;
	};
	
	AnimatorModel.prototype.setAnimation = function(animation) {
		this.setModel(animation.model);
		this.animation = animation;
		this.animDirty = false;
		this.name = animation.name;
		this.startTime = animation.beginTime;
		this.endTime = animation.endTime;
		this.isUpdate = true;
		this.notifyListeners(editor.events.Editing, animation);
	};
	
	AnimatorModel.prototype.setEnd = function(endFrame) {
		this.endTime = hemi.getTimeOfFrame(endFrame);
	};
	
	AnimatorModel.prototype.setModel = function(model) {	            
		if (this.selectedModel !== model) {
			this.unSelectAll();
			this.notifyListeners(shorthand.events.ModelPicked, model);
			this.selectedModel = model;
			if (model != null) {
//					this.hilightShapes();
			}
		}
	};
	
	AnimatorModel.prototype.setName = function(name) {
		this.name = name;
	};
	
	AnimatorModel.prototype.setStart = function(startFrame) {
		this.startTime = hemi.getTimeOfFrame(startFrame);
	};
	
	/**
	 * Stops an animation and resets to the beginning keyframe.
	 */
	AnimatorModel.prototype.stopAnimation = function() {
		if (this.animation) {
			this.animation.stop();
			this.animation.reset();
			//this.animation.updateTarget(this.animation.currentTime);
		}
	};
	
	/**
	 * Unselects the current selection(s).
	 */
	AnimatorModel.prototype.unSelectAll = function() {
		if (this.selectedModel) {
			this.removeHilights();
			this.selectedModel = null;
			this.animation = null;
			this.isUpdate = false;
		}
	};
	
	AnimatorModel.prototype.worldCleaned = function() {
		var animations = hemi.world.getAnimationGroups();
		
		for (var ndx = 0, len = animations.length; ndx < len; ndx++) {
			var anm = animations[ndx];
			this.notifyListeners(editor.events.Removing, anm);
		}
        this.notifyListeners(shorthand.events.CleanUpWidget);

	};
	
	AnimatorModel.prototype.worldLoaded = function() {
		var animations = hemi.world.getAnimationGroups();
		
		for (var ndx = 0, len = animations.length; ndx < len; ndx++) {
			var anm = animations[ndx];
			this.notifyListeners(editor.events.Created, anm);
		}
	};

	
////////////////////////////////////////////////////////////////////////////////
//                     Create Animation Sidebar Widget                        //
//////////////////////////////////////////////////////////////////////////////// 
	
	var ButtonText = {
		START: 'Start Preview',
		STOP: 'Stop Preview'
	};
	
	var CreateWidget = function() {
		editor.ui.FormWidget.call(this, {
			name: 'createAnmWidget',
			uiFile: 'js/editor/plugins/animations/html/animationsForms.htm',
			instructions: 'Click on a model to select it'        
		});
		
		this.loops = [];
		var wgt = this;
		
		hemi.subscribe(hemi.msg.load, function(msg) {
			if (msg.src instanceof hemi.Model) {
				var mdl = msg.src,
					id = mdl._getId();
				wgt.selector.append('<option id="anmMdlSel_' + id + '" value="' + id + '">'
					+ mdl.name + '</option>');
			}
		});
		
		hemi.subscribe(hemi.msg.unload, function(msg) {
			if (msg.src instanceof hemi.Model) {
				var id = msg.src._getId(),
					elemId = 'anmMdlSel_' + id;
				if (parseInt(wgt.selector.val()) === id) {
					wgt.reset();
				}
				
				wgt.find('#' + elemId).remove();
			}
		});
	};
	
	var crtWgtSuper = editor.ui.FormWidget.prototype;
	
	CreateWidget.prototype = new editor.ui.FormWidget();
	CreateWidget.prototype.constructor = CreateWidget;
		
	CreateWidget.prototype.addLoopInput = function(loop, min, max) {
		var wgt = this,
			wrapper = jQuery('<li class="loopEditor"></li>'),
			startVal = loop.startTime * hemi.getFPS(),
			endVal = loop.stopTime * hemi.getFPS(),
			itrVal = loop.iterations,
			validator = new editor.ui.Validator(null, function(elem) {
				var val = elem.val(),
					begins = startInput.getValue(),
					ends = endInput.getValue(),
					min = slider.slider('option', 'min'),
					max = slider.slider('option', 'max'),
					msg = null;
					
				if (val !== '' && !hemi.utils.isNumeric(val)) {
					msg = 'must be a number';
				}
				else if (elem.hasClass('loopStart')) {
					if (begins > ends && ends >= min) {
						msg = 'beginning must be less than end';
					}
					else if (begins < min) {
						msg = 'must be greater than or equal to ' + min; 
					}
				}
				else if (elem.hasClass('loopEnd')) {
					if (begins > ends && begins <= max) {
						msg = 'end must be greater than beginning';
					}
					else if (ends > max) {
						msg = 'must be less than or equal to ' + max;
					}
				}
				
				return msg;
			}),
			blurFcn = function(ipt, evt) {
				var begins = startInput.getValue(),
					ends = endInput.getValue(),
					itr = itrInput.getValue(),
					curMin = slider.slider('option', 'min'),
					curMax = slider.slider('option', 'max');
				
				if (begins != null && ends != null && itr != null
						&& begins <= ends && begins >= curMin
						&& ends <= curMax) {
					slider.slider('option', 'values', [begins, ends]);
					
					wgt.notifyListeners(shorthand.events.EditAnmLoop, {
						loop: wrapper.data('obj'),
						start: begins,
						end: ends,
						itr: itr
					});
				}
			},
			startInput = new editor.ui.Input({
				inputClass: 'loopStart',
				onBlur: blurFcn,
				placeHolder: 'From',
				type: 'integer',
				validator: validator
			}),
			endInput = new editor.ui.Input({
				inputClass: 'loopEnd',
				onBlur: blurFcn,
				placeHolder: 'To',
				type: 'integer',
				validator: validator
			}),
			itrInput = new editor.ui.Input({
				onBlur: blurFcn,
				placeHolder: 'Repeat',
				type: 'integer',
				validator: validator
			}),
			removeBtn = jQuery('<button class="icon removeBtn">Remove</button>'),
			formDiv = jQuery('<div class="loopForms"></div>'),
			slider = jQuery('<div class="loopSlider"></div>').slider({
					range: true,
					min: min,
					max: max,
					slide: function(evt, ui) {
						var min = ui.values[0],
							max = ui.values[1];
							
						startInput.setValue(min);	
						endInput.setValue(max);
					},
					values: [startVal, endVal]
				});
		
		this.find('#anmLoopData').show();
		slider.bind('slidechange', function(evt, ui) {
			var loop = wrapper.data('obj'),				
				values = slider.slider('option', 'values'),
				itr = itrInput.getValue();
				
				wgt.notifyListeners(shorthand.events.EditAnmLoop, {
					loop: loop,
					start: values[0],
					end: values[1],
					itr: itr
				});
		});
		
		removeBtn.bind('click', function(evt) {
			var loop = wrapper.data('obj');
			wgt.notifyListeners(shorthand.events.RemoveAnmLoop, loop);
		});
		
		formDiv.append(startInput.getUI()).append(endInput.getUI())
			.append(itrInput.getUI());
		wrapper.append(slider).append(formDiv).append(removeBtn)
			.data('obj', loop);
		
		startInput.setValue(startVal);
		endInput.setValue(endVal);
		itrInput.setValue(itrVal);
		
		this.loopList.append(wrapper);
		this.loops.push({
			loop: loop,
			start: startInput,
			end: endInput,
			slider: slider,
			wrapper: wrapper
		});
	};
	
	CreateWidget.prototype.removeLoop = function(loop) {
		for (var i = 0, il = this.loops.length; i < il; ++i) {
			var obj = this.loops[i];
			
			if (obj.loop === loop) {
				obj.wrapper.remove();
				this.loops.splice(i, 1);
				break;
			}
		}
	},
	
	CreateWidget.prototype.layout = function() {
		crtWgtSuper.layout.call(this);
		
		var wgt = this,
			inputs = this.find('#anmBeginFrame, #anmEndFrame, #anmName'),
			validator = new editor.ui.Validator(null, function(elem) {
				var val = elem.val(),
					id = elem.attr('id');
					begins = wgt.beginInput.getValue(),
					ends = wgt.endInput.getValue(),
					min = wgt.slider.slider('option', 'min'),
					max = wgt.slider.slider('option', 'max'),
					msg = null;
					
				if (val !== '' && !hemi.utils.isNumeric(val)) {
					msg = 'must be a number';
				}
				else if (id === 'anmBeginFrame') {
					if (begins > ends && ends >= min) {
						msg = 'beginning must be less than end';
					}
					else if (begins < min) {
						msg = 'must be greater than or equal to ' + min; 
					}
				}
				else if (id === 'anmEndFrame') {
					if (begins > ends && begins <= max) {
						msg = 'end must be greater than beginning';
					}
					else if (ends > max) {
						msg = 'must be less than or equal to ' + max;
					}
				}
				
				return msg;
			}),
			blurFcn = function(ipt, evt) {
				var param = ipt.getUI().attr('id'),
					begins = wgt.beginInput.getValue(),
					ends = wgt.endInput.getValue(),
					min = wgt.slider.slider('option', 'min'),
					max = wgt.slider.slider('option', 'max'),
					msgType = null,
					val = null;
				
				switch(param) {
					case 'anmBeginFrame':
						msgType = shorthand.events.SetAnmBeginFrame;
						val = begins;
						break; 
					case 'anmEndFrame':
						msgType = shorthand.events.SetAnmEndFrame;
						val = ends;
						break;
					case 'anmName':
						msgType = shorthand.events.SetAnmName;
						val = wgt.nameInput.getValue();
						break;
				}

				if (val != null && begins <= ends && begins >= min 
						&& ends <= max) {	
					wgt.canSave();	
					wgt.slider.slider('option', {
						values: [begins, ends]
					});
					wgt.find('.loopSlider').slider('option', {
						min: begins,
						max: ends
					});
					wgt.notifyListeners(msgType, val);
				}
			};
		
		this.slider = this.find('#anmSlider');
		this.selector = this.find('#anmModelSelect');
		this.addBtn = this.find('#anmLoopAdd');
		this.saveBtn = this.find('#anmSaveBtn');
		this.cancelBtn = this.find('#anmCancelBtn');
		this.anmPreviewBtn = this.find('#anmPreviewBtn');
		this.loopList = this.find('#anmLoopList');
		
		this.beginInput = new editor.ui.Input({
			container: wgt.find('#anmBeginFrame'),
			onBlur: blurFcn,
			validator: validator
		});
		this.endInput = new editor.ui.Input({
			container: wgt.find('#anmEndFrame'),
			onBlur: blurFcn,
			validator: validator
		});
		this.nameInput = new editor.ui.Input({
			container: wgt.find('#anmName'),
			onBlur: blurFcn,
			type: 'string'
		});
						 
		this.find('form').submit(function() {
			return false;
		});
		
		this.selector.bind('change', function(evt) {
			var mdl = hemi.world.getCitizenById(
				parseInt(jQuery(this).val()));
			wgt.notifyListeners(shorthand.events.ModelSelected, mdl);
			wgt.invalidate();
		});

		// Add any pre-existing loaded models
		var models = hemi.world.getModels();

		for (var i = 0, il = models.length; i < il; ++i) {
			var model = models[i],
				id = model._getId();

			this.selector.append('<option id="anmMdlSel_' + id + '" value="' + id + '">' +
				model.name + '</option>');
		}
			
		inputs.bind('keyup', function(evt) {				
			wgt.canSave();
		});
		
		this.slider.slider({
			range: true,
			min: 0,
			max: 100,
			values: [0, 100],
			slide: function(evt, ui) {
				var min = ui.values[0],
					max = ui.values[1];
					
				wgt.beginInput.setValue(min);	
				wgt.endInput.setValue(max);
				wgt.updateLoopLimits(min, max);
				wgt.canSave();
			},
			change: function(evt, ui) {					
				var min = ui.values[0],
					max = ui.values[1];

				wgt.updateLoopLimits(min, max);
				wgt.notifyListeners(shorthand.events.SetAnmBeginFrame, min);
				wgt.notifyListeners(shorthand.events.SetAnmEndFrame, max);
			}
		});
		
		this.anmPreviewBtn.bind('click', function(evt) {
			var btn = jQuery(this);
			
			if (btn.data('previewing')) {
				wgt.notifyListeners(shorthand.events.StopPreview, null);
				btn.text(ButtonText.START).data('previewing', false);
			}
			else {
				wgt.notifyListeners(shorthand.events.StartPreview, null);
				btn.text(ButtonText.STOP).data('previewing', true);
			}
		}).data('previewing', false);
		
		this.addBtn.bind('click', function(evt) {         
			var start = wgt.beginInput.getValue(), 
				end = wgt.endInput.getValue();
					
			wgt.notifyListeners(shorthand.events.AddAnmLoop, {
				start: start,
				end: end
			});
			wgt.invalidate();
		});
		
		this.saveBtn.bind('click', function(evt) {
			var start = wgt.beginInput.getValue(), 
				end = wgt.endInput.getValue(),
				name = wgt.nameInput.getValue();
			
			wgt.notifyListeners(shorthand.events.SaveAnimation, {
				start: start,
				end: end,
				name: name
			});
			wgt.reset();
		});
		
		this.cancelBtn.bind('click', function(evt) {
			wgt.reset();
			wgt.notifyListeners(editor.events.Cancel, null);
			wgt.find('input.error').removeClass('error');
			wgt.invalidate();
		});
	},	
	
	CreateWidget.prototype.modelSelected = function(model) { 
		this.reset();

		if (model) {
			var fps = hemi.getFPS(),
				max = model.getMaxAnimationTime(),
				min = model.getMinAnimationTime();

			if (max !== null) max = parseInt(max * fps, 10);
			if (min !== null) min = parseInt(min * fps, 10);

			this.selector.val(model._getId());

			if (max !== null && min !== null) {
				this.find('#anmKeyframes, #anmLoops, #anmPreview').show(200);
				this.slider.slider('option', {
					min: min,
					max: max,
					values: [min, max]
				});

				this.beginInput.setValue(min);
				this.endInput.setValue(max);
				this.notifyListeners(shorthand.events.SetAnmBeginFrame, min);
				this.notifyListeners(shorthand.events.SetAnmEndFrame, max);
			}

			this.canSave();
		} 
	};
	
	CreateWidget.prototype.reset = function() {
		this.loops = [];
		this.beginInput.reset();
		this.endInput.reset();
		this.nameInput.reset();
		this.selector.val(-1);
		this.find('#anmKeyframes, #anmLoops, #anmPreview').hide();
		this.find('#anmLoopList').find('.loopEditor').remove();
		this.canSave();
	};
	
	CreateWidget.prototype.set = function(animation) {
		this.reset();
		
		this.selector.val(animation.model._getId());
		this.find('#anmKeyframes, #anmLoops, #anmPreview').show();
		
		var loopList = animation.loops,
			min = animation.beginTime * hemi.getFPS(),
			max = animation.endTime * hemi.getFPS();
		
		for (var ndx = 0, len = loopList.length; ndx < len; ndx++) {
			this.addLoopInput(loopList[ndx], min, max);
		}
		
		this.beginInput.setValue(min);
		this.endInput.setValue(max);
		this.nameInput.setValue(animation.name);
		
		this.slider.slider('option', {
			values: [min, max]
		});
		
		this.anmPreviewBtn.removeAttr('disabled');
	};
	
	CreateWidget.prototype.updateLoopLimits = function(min, max) {
		for (var i = 0, il = this.loops.length; i < il; ++i) {
			var obj = this.loops[i],
				starts = obj.start.getValue(),
				ends = obj.end.getValue();
			
			if (starts < min) {
				starts = min;
				obj.start.setValue(min);
			}
			if (ends > max) {
				ends = max;
				obj.end.setValue(max);
			}
			
			obj.slider.slider('option', {
				min: min,
				max: max
			})
			.slider('option', 'values', [starts, ends]);
		}
	};
	
	CreateWidget.prototype.canSave = function() {
		var start = this.beginInput.getValue(), 
			end = this.endInput.getValue(),
			name = this.nameInput.getValue();
		
		if (start != null && end != null) {				
			this.anmPreviewBtn.removeAttr('disabled');
			
			if (name != null) {
				this.saveBtn.removeAttr('disabled');
			} else {
				this.saveBtn.attr('disabled', 'disabled');
			}
		} else {
			this.saveBtn.attr('disabled', 'disabled');
			this.anmPreviewBtn.attr('disabled', 'disabled');
		}
	};

    CreateWidget.prototype.cleanWidget = function() {
        this.reset();
        var wgt = this, 
            children = wgt.selector.children();
        for (var i = 0; i < children.length; i ++) {
            var child = children[i],
                val = child.getAttribute("value");
            if (val > -1) {
                var elemId = 'anmMdlSel_' + val;
				wgt.find('#' + elemId).remove();
            }
        }

    };


////////////////////////////////////////////////////////////////////////////////
//                                   View                                     //
////////////////////////////////////////////////////////////////////////////////    
	
	/**
	 * The AnimatorView controls the dialog and toolbar widget for the 
	 * animation tool.
	 */
	var AnimatorView = function() {
		editor.ToolView.call(this, {
			toolName: 'Animator',
			toolTip: 'Create and edit key frame animations',
			id: 'animations'
		});
		this.addPanel(new editor.ui.Panel({
			name: 'sidePanel',
			classes: ['anmSidePanel']
		}));
		
		this.sidePanel.addWidget(new CreateWidget());
		this.sidePanel.addWidget(new editor.ui.ListWidget({
			name: 'anmListWidget',
			listId: 'animationList',
			prefix: 'anmLst',
			instructions: "Add animations above.",
			title: 'Animations'
		}));
	};
	
	AnimatorView.prototype = new editor.ToolView();
	AnimatorView.prototype.constructor = AnimatorView;
	
////////////////////////////////////////////////////////////////////////////////
//                                Controller                                  //
////////////////////////////////////////////////////////////////////////////////

	/**
	 * The AnimatorController facilitates AnimatorModel and AnimatorView
	 * communication by binding event and message handlers.
	 */
	var AnimatorController = function() {
		editor.ToolController.call(this);
	};
	
	var AnimatorCtrSuper = editor.ToolController.prototype;
	
	AnimatorController.prototype = new editor.ToolController();
	AnimatorController.prototype.constructor = AnimatorController;
	/**
	 * Binds event and message handlers to the view and model this object 
	 * references.  
	 */
	AnimatorController.prototype.bindEvents = function() {
		AnimatorCtrSuper.bindEvents.call(this);
		
		var model = this.model,
			view = this.view,
			crtWgt = view.sidePanel.createAnmWidget,
			lstWgt = view.sidePanel.anmListWidget;
		
		view.addListener(editor.events.ToolModeSet, function(value) {
			var isDown = value.newMode == editor.ToolConstants.MODE_DOWN;				
			model.enableModelPicking(isDown);
			model.stopAnimation();
		});	
		
		// creat animation widget specific		    
		crtWgt.addListener(shorthand.events.AddAnmLoop, function(obj) {
			var loop = model.createLoop(obj.start, obj.end, -1);		
			crtWgt.addLoopInput(loop, obj.start, obj.end);      
		});	  	
		crtWgt.addListener(editor.events.Cancel, function () {
			model.unSelectAll();
			model.stopAnimation();
		});   
		crtWgt.addListener(shorthand.events.EditAnmLoop, function(obj) {				
			model.saveLoop(obj.loop, obj.start, obj.end, obj.itr);     
		});	
		crtWgt.addListener(shorthand.events.RemoveAnmLoop, function(value) {
			model.removeLoop(value);
		});		
		crtWgt.addListener(shorthand.events.SaveAnimation, function (value) {
			var animation = model.saveAnimation();       	            
			if (animation) {
				crtWgt.reset();
				model.unSelectAll();
			}
		});
		crtWgt.addListener(shorthand.events.SetAnmBeginFrame, function (starts) {
			model.setStart(starts);     
		});			
		crtWgt.addListener(shorthand.events.SetAnmEndFrame, function (ends) {
			model.setEnd(ends);     
		});			
		crtWgt.addListener(shorthand.events.SetAnmName, function (name) {
			model.setName(name);     
		});	
		crtWgt.addListener(shorthand.events.StartPreview, function(value) {
			model.previewAnimation();			
		});	        
		crtWgt.addListener(shorthand.events.StopPreview, function(value) {
			model.stopAnimation();
		});	   
		crtWgt.addListener(shorthand.events.ModelSelected, function(mdl) {
			model.setModel(mdl);
		});		 	
		
		// animation list widget specific
		lstWgt.addListener(editor.events.Edit, function(animation) {
			model.setAnimation(animation);
		});			
		lstWgt.addListener(editor.events.Remove, function(animation) {
			model.removeAnimation(animation);
		});
		
		// model specific	
		model.addListener(editor.events.Created, function(animation) {
			editor.depends.add(animation, animation.target);
			lstWgt.add(animation);
		});
		model.addListener(editor.events.Editing, function(animation) {
			crtWgt.set(animation);
		});	     	
		model.addListener(editor.events.Removing, function(animation) {
			editor.depends.remove(animation, animation.target);
			lstWgt.remove(animation);
		});
		model.addListener(shorthand.events.AnimationStopped, function(value) {
			crtWgt.anmPreviewBtn.text(ButtonText.START).data('previewing', false);
		});
		model.addListener(shorthand.events.LoopRemoved, function(loop) {
			crtWgt.removeLoop(loop);
		});
		model.addListener(editor.events.Updated, function(animation) {
			lstWgt.update(animation);
		});		
		model.addListener(shorthand.events.ModelPicked, function(model) {
			crtWgt.modelSelected(model);
		});
        model.addListener(shorthand.events.CleanUpWidget, function() {
            crtWgt.cleanWidget();
        });
	}

////////////////////////////////////////////////////////////////////////////////
//                     			  	Extra Scripts  		                      //
////////////////////////////////////////////////////////////////////////////////

	editor.getCss('js/editor/plugins/animations/css/style.css');
})();
