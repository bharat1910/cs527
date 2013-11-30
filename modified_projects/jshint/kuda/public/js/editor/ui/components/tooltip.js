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

(function(editor) {
	"use strict";
	
	editor.ui = editor.ui || {};
	
	// internal.  no one else can see or use
	var Tooltip = function(options) {
		var newOpts = jQuery.extend({
			cls: '',
			mouseHide: true
		}, options);
		
		editor.ui.Component.call(this, newOpts);
		this.id = 0;
		this.currentElement = null;
	};
		
	Tooltip.prototype = new editor.ui.Component();
	Tooltip.prototype.constructor = Tooltip;
		
	Tooltip.prototype.layout = function() {
		var wgt = this,
			hideFromMouse = function() {
				if (!wgt.isAnimating) {
					wgt.hide(0);
				}
			};
		
		this.container = jQuery('<div class="tooltip ' + this.config.cls + '"></div>');
		this.msg = jQuery('<div class="content"></div>');
		this.arrow = jQuery('<div class="arrow"></div>');
		
		// attach to the main body and bind mouse handler
		this.container.append(this.msg);
		
		if (this.config.mouseHide) {
			this.container.bind('mouseenter', hideFromMouse)
			.bind('mouseleave', hideFromMouse);
		}
		
		// detect border
		if (this.msg.css('borderLeftWidth') !== 0) {
			this.arrow.addClass('outer');
			this.innerArrow = jQuery('<div class="innerArrow"></div>');
			this.msg.before(this.arrow);
			this.container.append(this.innerArrow);
		}
		else {
			this.container.append(this.arrow);
		}
		
		// hide
		this.container.hide();
		this.isVisible = false;
	};
	
	Tooltip.prototype.show = function(element, content, opt_autohide, opt_offset) {
		var ctn = this.container,
			wgt = this,
			off = jQuery.extend({ top: 0, left: 0 }, opt_offset);
		
		this.currentElement = element;
		
		if (this.container.parents().size() === 0) {
			jQuery('body').append(this.container);
		}
		
		if (jQuery.type(content) == 'string') {
			this.msg.text(content);
		}
		else {
			this.msg.empty().append(content);
		}
		ctn.show();
		
		var	offset = element.offset(),
			height = ctn.outerHeight(true),
			width = ctn.outerWidth(true),
			center = element.width() / 2,
			elemHeight = element.height(),
			atTop = offset.top - height < 0,
			arrowHeight = this.arrow.outerHeight(),
			arrowCenter = this.arrow.outerWidth() / 2,
			arrowLeft = arrowCenter > center ? 5 : center - arrowCenter,
			windowWidth = window.innerWidth ? window.innerWidth 
				: document.documentElement.offsetWidth,
			windowHeight = jQuery(window).height(),
			difference = width + offset.left > windowWidth 
				? offset.left - (windowWidth - width) : 0,
			top = atTop ? offset.top + elemHeight + arrowHeight  + off.top
				: offset.top - height - off.top,
			bottom = atTop ? windowHeight - (offset.top + elemHeight 
				+ arrowHeight + off.top + height) 
				: windowHeight - (offset.top - off.top);
		
		// position this
		ctn.css({
			bottom: bottom - 20,
			left: offset.left - difference
		});
		
		if (atTop) {
			this.innerArrow.addClass('top');
			this.arrow.addClass('top');
		}
		else {
			this.innerArrow.removeClass('top');
			this.arrow.removeClass('top');
		}			
		
		// position the arrow
		this.innerArrow.css({
			left: arrowLeft 
		});
		this.arrow.css({
			left: arrowLeft
		});
		
		if (!this.isAnimating) {
			var doc = jQuery(document),
				checkMouse = function(evt) {
					// Make sure the mouse is still over the correct element
					if (wgt.currentElement) {
						var ce = wgt.currentElement[0],
							et = evt.target,
							ep = jQuery(et).parent()[0];
						
						if (et !== ce && ep !== ce) {
							wgt.hide(0);
						}
					}
					doc.unbind('mousemove', checkMouse);
				};
			
			this.isAnimating = true;				
			ctn.css('opacity', 0).animate({
				opacity: 1,
				bottom: '+=20'
			}, 200, function(){
				wgt.isAnimating = false;
				wgt.isVisible = true;
				doc.bind('mousemove', checkMouse);
			});
		}
		
		// auto hide the message
		if (opt_autohide != null) {
			this.hideTimer(true, opt_autohide);
		}
	};
	
	Tooltip.prototype.hide = function(opt_time) {
		this.hideTimer(false, opt_time);
	};
	
	Tooltip.prototype.hideTimer = function(resetTimer, opt_time) {
		var wgt = this,
			id = this.id,
			time = opt_time == null ? 2000 : opt_time;
		
		if (resetTimer) {
			id = this.id += 1;
		}
		
		setTimeout(function() {
			wgt.hideMessage(id);
		}, time);
	};
	
	Tooltip.prototype.hideMessage = function(id) {
		if (this.id === id) {
			var ctn = this.container,
				wgt = this;
			
			ctn.animate({
				opacity: 0,
				bottom: '+=20'
			}, 200, function(){
				ctn.hide();
				wgt.isVisible = false;
				wgt.currentElement = null;
			});
		}
	};
	
	editor.ui.createTooltip = function(opts) {		
		return new Tooltip(opts);
	};
	
})(editor);
