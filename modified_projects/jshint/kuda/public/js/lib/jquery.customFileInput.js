/* jshint undef: false, unused: false, asi: true */
jQuery.fn.choose = function(f) {
	$(this).bind('choose', f);
};


jQuery.fn.file = function(options) {
	var opts = jQuery.extend({
		multiple: false
	}, options);
	
	return this.each(function() {
		var btn = $(this);
		var pos = btn.offset();
								
		function update() {
			pos = btn.offset();
			var z = btn.css('z-index'),
				p = btn.parent();
			while (z === 'auto') {
				p = p.parent();
				z = p[0] == document.body ? 1000 : p.css('z-index');
			}
			file.css({
				'top': pos.top,
				'left': pos.left,
				'width': btn.width(),
				'height': btn.height(),
				'z-index': parseInt(z) + 1
			});
		}

		btn.mouseover(update);

		var hidden = $('<div></div>').css({
			'display': 'none'
		}).appendTo('body');

		var file = $('<div><form></form></div>').appendTo('body').css({
			'position': 'absolute',
			'overflow': 'hidden',
			'filter':  'alpha(opacity: 0)',
			'opacity': '0',
			'z-index': '1000'		
		});

		var form = file.find('form');
		var input = $('<input type="file"' + (opts.multiple ? ' multiple' : '') + '>').appendTo(form);//form.find('input');
		
//		function reset() {
//			var input = $('<input type="file">').appendTo(form);
			input.change(function(e) {
//				input.unbind();
//				input.detach();
				btn.trigger('choose', [this]);
//				reset();
			});
//		};
		
//		reset();

		function placer(e) {
			form.css('margin-left', e.pageX - pos.left - offset.width);
			form.css('margin-top', e.pageY - pos.top - offset.height + 3);					
		}

		function redirect(name) {
			file[name](function(e) {
				btn.trigger(name);
			});
		}

		file.mousemove(placer);
		btn.mousemove(placer);

		redirect('mouseover');
		redirect('mouseout');
		redirect('mousedown');
		redirect('mouseup');

		var offset = {
			width: file.width() - 50,
			height: file.height() / 2
		};

		update();
	});
};
