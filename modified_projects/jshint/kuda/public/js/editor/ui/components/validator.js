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

(function(editor) {
	"use strict";
	
	editor.ui = editor.ui || {};
	
	var tooltip = new editor.ui.createTooltip({
			cls: 'errorWrapper'
		});
	
////////////////////////////////////////////////////////////////////////////////////////////////////
//                                			  Validator	                                          //
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var Validator = editor.ui.Validator = function(opt_elements, checkFunction) {
		editor.utils.Listenable.call(this);
		this.checkFunction = checkFunction;
		this.containerClass = 'errorWrapper';
		
		if (opt_elements != null) {			
			this.setElements(opt_elements);
		}
	};
		
	Validator.prototype = new editor.utils.Listenable();
	Validator.prototype.constructor = Validator;
		
	Validator.prototype.setElements = function(elements) {	
		var vld = this;
				
		elements.bind('change.errEvt', function(evt) {
			var elem = jQuery(this),
				msg = null;
							
			msg = vld.checkFunction(elem);
			
			if (msg) {
				tooltip.show(elem, msg, 2000);
				elem.addClass('error');
			}
			else {
				tooltip.hide();	
				elem.removeClass('error');
			}
		});
	};
	
////////////////////////////////////////////////////////////////////////////////////////////////////
//                                		  Vector Validator                                        //
////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var VectorValidator = editor.ui.VectorValidator = function(vector) {
		editor.utils.Listenable.call(this);
		this.containerClass = 'errorWrapper';
		this.timeoutId = null;
		this.vector = vector;
		
		var vecInputs = vector.find('.' + vector.config.type),
			that = this;
		
		vecInputs.bind('focus', function(evt) {
			if (that.timeoutId) {
				clearTimeout(that.timeoutId);
				that.timeoutId = null;
			}
		})
		.bind('blur', function(evt) {
			var inputs = that.vector.inputs,
				firstVal = inputs[0].elem.getValue(),
				isNull = firstVal === '' || firstVal === null,
				msg = null;
			
			for (var i = 1, il = inputs.length; i < il && !msg; i++) {
				var val = inputs[i].elem.getValue(),
					check = val === '' || val === null;
				
				if (check !== isNull) {
					msg = 'must fill out all values';
				}
			}
			
			if (msg) {
				that.timeoutId = setTimeout(function() {
					that.timeoutId = null;
					tooltip.show(that.vector.getUI(), msg, 3000);
					vecInputs.addClass('error');
				}, 1500);
			} else {
				tooltip.hide();	
				vecInputs.removeClass('error');
			}
		});
	};
		
	VectorValidator.prototype = new editor.utils.Listenable();
	VectorValidator.prototype.constructor = VectorValidator;
	
	editor.ui.createDefaultValidator = function(opt_min, opt_max) {
		var validator = new editor.ui.Validator(null, function(elem) {
			var val = elem.val(),
				msg = null;
				
			if (!checkNumber(val)) {
				msg = 'must be a number';
			}
			else if ((this.min != null || this.max != null) 
					&& !checkRange(val, this.min, this.max)) {						
				msg = this.min != null && this.max != null ? 
					'must be between ' + this.min + ' and ' + this.max
					: this.min != null ? 'must be greater than or equal to ' + this.min 
					: 'must be less than or equal to ' + this.max;
			}
			
			return msg;
		});
		
		validator.min = opt_min;
		validator.max = opt_max;
		
		return validator;	
	};
	
	function checkNumber(val) {	
		return val === '' || hemi.utils.isNumeric(val);
	};
		
	function checkRange(val, min, max) {
		var num = parseFloat(val);					
		return val === '' || (min != null && max != null 
			? num >= min && num <= max 
			: min != null && max == null ? num >= min : num <= max);
	};
	
	return editor;
})(editor || {}, jQuery);
