/* jshint undef: true, unused: true */
/*
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * The MIT License (MIT)
 * 
 * Copyright (c) 2011 SRI International
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated  documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the  Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function() {

////////////////////////////////////////////////////////////////////////////////////////////////////
// Timer class
////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @class A Timer is a simple countdown timer that can be used to script behavior and sequence
	 * events.
	 */
	var Timer = function() {
		/*
		 * The epoch time that this Timer was last started (or resumed).
		 * @type number
		 */
		this._started = null;
		/*
		 * The elapsed time (not including any currently running JS timer).
		 * @type number
		 */
		this._time = 0;
		/*
		 * The id of the current JS timer.
		 * @type number
		 */
		this._timeId = null;
		/**
		 * The time the timer will start counting down from (milliseconds).
		 * @type number
		 * @default 1000
		 */
		this.startTime = 1000;
	};

	/*
	 * Remove all references in the Timer.
	 */
	Timer.prototype._clean = function() {
		if (this._timeId !== null) {
			clearTimeout(this._timeId);
			this._timeId = null;
			this._started = null;
		}
	};

	/*
	 * Array of Hemi Messages that Timer is known to send.
	 * @type string[]
	 */
	Timer.prototype._msgSent = [hemi.msg.start, hemi.msg.stop];

	/*
	 * Octane properties for Timer.
	 * @type string[]
	 */
	Timer.prototype._octane = ['startTime'];

	/**
	 * Pause the Timer if it is currently running.
	 */
	Timer.prototype.pause = function() {
		if (this._timeId !== null) {
			clearTimeout(this._timeId);
			this._timeId = null;

			var stopped = (new Date()).getTime();
			this._time += (stopped - this._started);
		}
	};

	/**
	 * Reset the Timer so it is ready to count down again.
	 */
	Timer.prototype.reset = function() {
		this._started = null;
		this._time = 0;
		this._timeId = null;
	};

	/**
	 * Resume the Timer's count down if it is currently paused.
	 */
	Timer.prototype.resume = function() {
		if (this._timeId === null && this._started !== null) {
			this._timeId = setTimeout(handleTimeout, this.startTime - this._time, this);
			this._started = (new Date()).getTime();
		}
	};

	/**
	 * Start the Timer's count down. If it is currently running, restart the Timer from its initial
	 * count down value.
	 */
	Timer.prototype.start = function() {
		if (this._timeId !== null) {
			clearTimeout(this._timeId);
		}

		this._time = 0;
		this.send(hemi.msg.start, {
			time: this.startTime
		});
		this._timeId = setTimeout(handleTimeout, this.startTime, this);
		this._started = (new Date()).getTime();
	};

	/**
	 * Stop the Timer if it is currently running or paused. This resets any currently elapsed time
	 * on the Timer.
	 */
	Timer.prototype.stop = function() {
		if (this._timeId !== null) {
			clearTimeout(this._timeId);
			var stopped = (new Date()).getTime();
			this._time += (stopped - this._started);
		}

		if (this._started !== null) {
			var elapsed = this._time;
			this.reset();
			this.send(hemi.msg.stop, {
				time: elapsed
			});
		}
	};

	hemi.makeCitizen(Timer, 'hemi.Timer', {
		cleanup: Timer.prototype._clean,
		toOctane: Timer.prototype._octane
	});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility functions
////////////////////////////////////////////////////////////////////////////////////////////////////

	/*
	 * Utility to handle the Timer naturally finishing its countdown.
	 */
	function handleTimeout(timer) {
		timer.reset();
		timer.send(hemi.msg.stop, {
			time: timer.startTime
		});
	}

})();
