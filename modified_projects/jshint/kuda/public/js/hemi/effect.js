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

	var defaultParticleSystem = new hemi.particles.System(),
		_vector = new THREE.Vector3();

	// The default particle system updates using render time.
	hemi.addRenderListener({
		isParticleSystem: true,
		onRender: function(event) {
			defaultParticleSystem.update(event.elapsedTime);
		}
	});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * A set of names of predefined per-particle parameter setting functions.
	 */
	hemi.ParticleFunctionIds = {
		Acceleration : 'Acceleration',
		Puff: 'Puff'
	};

////////////////////////////////////////////////////////////////////////////////////////////////////
// ParticleFunction class
////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @class A ParticleFunction specifies a predefined per-particle parameter setting function and
	 * any properties it might require.
	 * @example
	 * Each function must be of the form:
	 * 
	 * function(number, hemi.core.particles.ParticleSpec): void
	 * 
	 * The number is the index of the particle being created. The ParticleSpec is a set of
	 * parameters for that particular particle.
	 */
	var ParticleFunction = function() {
		/**
		 * The name of the predefined parameter setting function.
		 * @type hemi.ParticleFunctionIds
		 */
		this.name = null;

		/**
		 * A set of options to customize values that the function uses to
		 * calculate the particle parameters.
		 * @type Object
		 */
		this.options = {};
	};

	hemi.ParticleFunction = ParticleFunction;
	hemi.makeOctanable(hemi.ParticleFunction, 'hemi.ParticleFunction', ['name', 'options']);

////////////////////////////////////////////////////////////////////////////////////////////////////
// ParticleEmitter class
////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @class A ParticleEmitter constantly generates particles.
	 */
	var ParticleEmitter = function(client) {
		this._newSystem = false;
		this._system = null;

		/**
		 * The blending state to use for drawing particles.
		 * @type number
		 * @default THREE.AdditiveBlending
		 */
		this.blending = THREE.AdditiveBlending;

		this.client = client;

		/**
		 * An array of colors for each particle to transition through. Each color value is in the
		 * form RGBA.
		 * @type number[]
		 */
		this.colorRamp = [];

		/**
		 * A set of parameters for the ParticleEmitter.
		 * @type hemi.particles.Spec
		 */
		this.params = {};

		/**
		 * Optional specs that identify a particle updating function to use and properties to set
		 * for it.
		 * @type hemi.ParticleFunctionIds
		 */
		this.particleFunction = null;

		/* The actual emitter for the ParticleEmitter */
		this.particles = null;

		/* The containing Transform for the Effect */
		this.transform = null;
	};

	/*
	 * Remove all references in the ParticleEmitter.
	 */
	ParticleEmitter.prototype._clean = function() {
		var emitters = this._system.emitters,
			ndx = emitters.indexOf(this.particles);

		emitters.splice(ndx, 1);
		if (this.transform) {
			this.transform.parent.remove(this.transform);
		}
		this.transform = null;
		this.particles = null;
	};

	/*
	 * Array of Hemi Messages that ParticleEmitter is known to send.
	 * @type string[]
	 */
	ParticleEmitter.prototype._msgSent = [hemi.msg.visible];

	/*
	 * Octane properties for ParticleEmitter.
	 * @type string[]
	 */
	ParticleEmitter.prototype._octane = ['_newSystem', 'blending', 'client', 'colorRamp', 'params',
		'particleFunction', 'setup'];

	/**
	 * Set the ParticleEmitter to not be visible.
	 */
	ParticleEmitter.prototype.hide = function() {
		if (this.particles === null) {
			this.setup();
		}

		if (this.transform.visible) {
			this.transform.visible = false;
			this.send(hemi.msg.visible, {
				visible: false
			});
		}
	};

	/**
	 * Set the particles up for the ParticleEmitter.
	 */
	ParticleEmitter.prototype.setup = function() {
		// Create a deep copy of the parameters since the particle emitter will mutate them as it
		// fires.
		var clonedParams = hemi.utils.clone(this.params),
			paramSetter = null,
			position = null;

		// It's okay if paramSetter stays null.
		if (this.particleFunction !== null) {
			paramSetter = hemi.getParticleFunction(this.particleFunction);
		}

		if (clonedParams.position) {
			position = clonedParams.position;
			clonedParams.position = [0, 0, 0];
		}

		this._system = this._newSystem ? new hemi.particles.System() : defaultParticleSystem;
		this.particles = this._system.createEmitter(this.client.camera.threeCamera);
		this.particles.setBlending(this.blending);
		this.particles.setColorRamp(this.colorRamp);
		this.particles.setParameters(clonedParams, paramSetter);

		this.transform = new THREE.Mesh(this.particles.shape, this.particles.material);
		this.transform.doubleSided = true; // turn off face culling
		this.transform.matrixAutoUpdate = false;

		if (position !== null) {
			// This helps prevent clipping issues
			this.transform.position.set(position[0], position[1], position[2]);
			this.transform.updateMatrix();
		}

		this.client.scene.add(this.transform);
	};

	/**
	 * Set the ParticleEmitter to be visible.
	 */
	ParticleEmitter.prototype.show = function() {
		if (this.particles === null) {
			this.setup();
		}

		if (!this.transform.visible) {
			this.transform.visible = true;
			this.send(hemi.msg.visible,{
				visible: true
			});
		}
	};

	hemi.makeCitizen(ParticleEmitter, 'hemi.ParticleEmitter', {
		cleanup: ParticleEmitter.prototype._clean,
		toOctane: ParticleEmitter.prototype._octane
	});

////////////////////////////////////////////////////////////////////////////////////////////////////
// ParticleBurst class
////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @class A ParticlesBurst generates one set of particles at a time. It can be used for a smoke
	 * puff, explosion, firework, water drip, etc.
	 * @extends hemi.ParticleEmitter
	 */
	var ParticleBurst = function(client) {
		ParticleEmitter.call(this, client);

		/* The OneShot particle effect */
		this.oneShot = null;
	};

	ParticleBurst.prototype = new ParticleEmitter();
	ParticleBurst.constructor = ParticleBurst;

	/*
	 * Remove all references in the ParticleBurst.
	 */
	ParticleBurst.prototype._clean = function() {
		ParticleEmitter.prototype._clean.call(this);

		this.oneShot = null;
	};

	/*
	 * Array of Hemi Messages that ParticleBurst is known to send.
	 * @type string[]
	 */
	ParticleBurst.prototype._msgSent = ParticleEmitter.prototype._msgSent.concat([hemi.msg.burst]);

	/**
	 * Set the particles up for the ParticleBurst.
	 */
	ParticleBurst.prototype.setup = function() {
		// Create a deep copy of the parameters since the particle emitter
		// will mutate them as it fires.
		var clonedParams = hemi.utils.clone(this.params),
			paramSetter = null,
			position = null;

		// It's okay if paramSetter stays null.
		if (this.particleFunction !== null) {
			paramSetter = hemi.getParticleFunction(this.particleFunction);
		}

		if (clonedParams.position) {
			position = clonedParams.position;
			clonedParams.position = [0, 0, 0];
		}

		this._system = this._newSystem ? new hemi.particles.System() : defaultParticleSystem;
		this.particles = this._system.createEmitter(this.client.camera.threeCamera);
		this.particles.setBlending(this.blending);
		this.particles.setColorRamp(this.colorRamp);
		this.particles.setParameters(clonedParams, paramSetter);

		this.transform = new THREE.Object3D();
		this.transform.matrixAutoUpdate = false;

		if (position !== null) {
			// This helps prevent clipping issues
			this.transform.position.set(position[0], position[1], position[2]);
			this.transform.updateMatrix();
		}

		this.client.scene.add(this.transform);
		this.oneShot = this.particles.createOneShot(this.transform);
	};

	/**
	 * Generate the particles for the ParticleBurst.
	 */
	ParticleBurst.prototype.trigger = function() {
		if (this.oneShot === null) {
			this.setup();
		}

		var pos = this.params.position;
		this.oneShot.trigger(_vector.set(pos[0], pos[1], pos[2]));
		this.send(hemi.msg.burst, {
			position: this.params.position
		});
	};

	hemi.makeCitizen(ParticleBurst, 'hemi.ParticleBurst', {
		cleanup: ParticleBurst.prototype._clean,
		toOctane: ParticleBurst.prototype._octane
	});

////////////////////////////////////////////////////////////////////////////////////////////////////
// ParticleTrail class
////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @class A ParticleTrail is a particle effect that can be started and stopped like an
	 * animation. It can be used for effects like exhaust.
	 * @extends hemi.ParticleEmitter
	 */
	var ParticleTrail = function(client) {
		ParticleEmitter.call(this, client);

		/* A flag that indicates if the ParticleTrail is currently animating */
		this.isAnimating = false;
		/* The number of seconds between particle births */
		this.fireInterval = 1;
		this.count = 0;
	};

	ParticleTrail.prototype = new ParticleEmitter();
	ParticleTrail.constructor = ParticleTrail;

	/*
	 * Array of Hemi Messages that ParticleTrail is known to send.
	 * @type string[]
	 */
	ParticleTrail.prototype._msgSent = ParticleEmitter.prototype._msgSent.concat(
		[hemi.msg.start, hemi.msg.stop]);

	/*
	 * Octane properties for ParticleTrail.
	 * @type string[]
	 */
	ParticleTrail.prototype._octane = ['fireInterval'].concat(ParticleEmitter.prototype._octane);

	/**
	 * Render event handling function that allows the ParticleTrail to animate.
	 * 
	 * @param {Object} event the render event
	 */
	ParticleTrail.prototype.onRender = function(event) {
		this.count += event.elapsedTime;

		if (this.count >= this.fireInterval) {
			this.count = 0;
			this.particles.birthParticles([0, 0, 0]);
		}
	};

	/**
	 * Set the particle emitter up for the ParticleTrail.
	 */
	ParticleTrail.prototype.setup = function() {
		// ParticleTrails use fireInterval instead of timeRange
		this.params.timeRange = undefined;

		// Create a deep copy of the parameters since the particle emitter will mutate them as it
		// fires.
		var clonedParams = hemi.utils.clone(this.params),
			paramSetter = null,
			position = null,
			// Calculate the maximum number of particles for the stream
			particlesPerFire = this.params.numParticles || 1,
			maxLife = this.params.lifeTime || 1 + this.params.lifeTimeRange || 0,
			maxFires = (maxLife / this.fireInterval) + 1,
			maxParticles = Math.ceil(maxFires * particlesPerFire);

		// It's okay if paramSetter stays undefined.
		if (this.particleFunction !== null) {
			paramSetter = hemi.getParticleFunction(this.particleFunction);
		}

		if (clonedParams.position) {
			position = clonedParams.position;
			clonedParams.position = [0, 0, 0];
		}

		this._system = this._newSystem ? new hemi.particles.System() : defaultParticleSystem;
		this.particles = this._system.createTrail(
			this.client.camera.threeCamera,
			maxParticles,
			clonedParams,
			null,
			paramSetter);
		this.particles.setBlending(this.blending);
		this.particles.setColorRamp(this.colorRamp);

		this.transform = new THREE.Mesh(this.particles.shape, this.particles.material);
		this.transform.doubleSided = true; // turn off face culling
		this.transform.matrixAutoUpdate = false;

		if (position !== null) {
			// This helps prevent clipping issues
			this.transform.position.set(position[0], position[1], position[2]);
			this.transform.updateMatrix();
		}

		this.client.scene.add(this.transform);
	};

	/**
	 * Start animating the ParticleTrail. It will generate particles based upon its fireInterval
	 * property.
	 */
	ParticleTrail.prototype.start = function() {
		if (this.particles === null) {
			this.setup();
		}

		if (!this.isAnimating) {
			this.isAnimating = true;
			hemi.addRenderListener(this);
			this.send(hemi.msg.start, { });
		}
	};

	/**
	 * Stop animating the ParticleTrail.
	 */
	ParticleTrail.prototype.stop = function() {
		if (this.particles === null) {
			this.setup();
		}

		if (this.isAnimating) {
			hemi.removeRenderListener(this);
			this.isAnimating = false;
			this.count = 0;
			this.send(hemi.msg.stop, { });
		}
	};

	hemi.makeCitizen(ParticleTrail, 'hemi.ParticleTrail', {
		cleanup: ParticleTrail.prototype._clean,
		toOctane: ParticleTrail.prototype._octane
	});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Global functions
////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Create a ParticleEmitter effect that constantly streams particles.
	 * 
	 * @param {hemi.Client} client the Client to render the effect
	 * @param {number[]} colorRamp array of color values in the form RGBA
	 * @param {hemi.particles.Spec} params parameters for the ParticleEmitter
	 * @param {number} opt_blending optional blending to use to draw particles
	 * @param {hemi.ParticleFunction} opt_function optional specs that identify a particle updating
	 *	   function to use and properties to set for it
	 * @return {hemi.ParticleEmitter} the newly created ParticleEmitter
	 */
	hemi.createParticleEmitter = function(client, colorRamp, params, opt_blending, opt_function) {
		var emitter = new hemi.ParticleEmitter(client);
		emitter.colorRamp = colorRamp;
		emitter.params = params;

		if (opt_blending !== undefined) emitter.blending = opt_blending;
		if (opt_function !== undefined)  emitter.particleFunction = opt_function;

		emitter.setup();
		return emitter;
	};

	/**
	 * Create a ParticleBurst effect that fires particles one shot at a time.
	 * 
	 * @param {hemi.Client} client the Client to render the effect
	 * @param {number[]} colorRamp array of color values in the form RGBA
	 * @param {hemi.particles.Spec} params parameters for the ParticleEmitter
	 * @param {number} opt_blending optional blending to use to draw particles
	 * @param {hemi.ParticleFunction} opt_function optional specs that identify a particle updating
	 *	   function to use and properties to set for it
	 * @return {hemi.ParticleBurst} the newly created ParticleBurst
	 */
	hemi.createParticleBurst = function(client, colorRamp, params, opt_blending, opt_function) {
		var burst = new hemi.ParticleBurst(client);
		burst.colorRamp = colorRamp;
		burst.params = params;

		if (opt_blending !== undefined) burst.blending = opt_blending;
		if (opt_function !== undefined)  burst.particleFunction = opt_function;

		burst.setup();
		return burst;
	};

	/**
	 * Create a ParticleTrail effect that fires particles at the specified
	 * interval.
	 * 
	 * @param {hemi.Client} client the Client to render the effect
	 * @param {number[]} colorRamp array of color values in the form RGBA
	 * @param {hemi.particles.Spec} params parameters for the ParticleEmitter
	 * @param {number} fireInterval seconds to wait between firing particles
	 * @param {number} opt_blending optional blending to use to draw particles
	 * @param {hemi.ParticleFunction} opt_function optional specs that identify a particle updating
	 *	   function to use and properties to set for it
	 * @return {hemi.ParticleTrail} the newly created ParticleTrail
	 */
	hemi.createParticleTrail = function(client, colorRamp, params, fireInterval, opt_blending, opt_function) {
		var trail = new hemi.ParticleTrail(client);
		trail.colorRamp = colorRamp;
		trail.params = params;
		trail.fireInterval = fireInterval;

		if (opt_blending !== undefined) trail.blending = opt_blending;
		if (opt_function !== undefined)  trail.particleFunction = opt_function;

		trail.setup();
		return trail;
	};

	/**
	 * Get the predefined per-particle parameter setting function for the given specs.
	 *
	 * @param {hemi.ParticleFunction} funcSpecs specs that identify the
	 *	   particle function to get and properties to set for it
	 * @return {function(number, hemi.particles.Spec): void} an instance of the predefined function
	 *	   with the appropriate properties set or null if the function name is not recognized
	 */
	hemi.getParticleFunction = function(funcSpecs) {
		var particleFunc;

		switch(funcSpecs.name) {
			case hemi.ParticleFunctionIds.Acceleration:
				particleFunc = getAccelerationFunction(funcSpecs.options);
				break;
			case hemi.ParticleFunctionIds.Puff:
				particleFunc = getPuffFunction(funcSpecs.options);
				break;
			default:
				particleFunc = null;
				break;
		}

		return particleFunc;
	};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility functions
////////////////////////////////////////////////////////////////////////////////////////////////////

	/*
	 * Get a function that sets each particle's acceleration by applying a factor to that particle's
	 * velocity. Valid options are:
	 * - factor : number[3] a factor to apply to each particle's XYZ velocity
	 *
	 * @param {Object} options customization options for the particle parameters
	 * @return {function(number, hemi.core.particles.ParticleSpec): void} an instance of the
	 *	   ParticleFunctionId.Acceleration function
	 */
	function getAccelerationFunction(options) {
		var acc = function (index, parameters) {
			parameters.acceleration = [
				acc.factor[0] * parameters.velocity[0],
				acc.factor[1] * parameters.velocity[1],
				acc.factor[2] * parameters.velocity[2]
			];
		};

		acc.factor = options.factor === undefined ? [0, 0, 0] : options.factor;
		return acc;
	}

	/*
	 * Get a function that sets each particle's velocity and acceleration to create a windblown puff
	 * effect. Valid options are:
	 * - wind : number[3] an XYZ acceleration to apply to each particle
	 * - size : number a factor to determine the size of the puff
	 * 
	 * @param {Object} options customization options for the particle parameters
	 * @return {function(number, hemi.core.particles.ParticleSpec): void} an instance of the
	 *	   ParticleFunctionId.Puff function
	 */
	function getPuffFunction(options) {
		var puff = function (index, parameters) {
			var angle = Math.random() * 2 * Math.PI,
				speed = 0.8 * puff.size,
				drag = -0.003 * puff.size;
			// Calculate velocity
			parameters.velocity = hemi.core.math.matrix4.transformPoint(
				hemi.core.math.matrix4.rotationY(7 * angle),
				[speed,speed,speed]);
			parameters.velocity = hemi.core.math.matrix4.transformPoint(
				hemi.core.math.matrix4.rotationX(angle),
				parameters.velocity);
			// Calculate acceleration
			parameters.acceleration = hemi.core.math.mulVectorVector(
				parameters.velocity,
				[drag,drag,drag]);
			parameters.acceleration = hemi.core.math.addVector(
				parameters.acceleration,
				puff.wind);
		};

		puff.wind = options.wind === undefined ? [0, 0, 0] : options.wind;
		puff.size = options.size === undefined ? 1 : options.size;
		return puff;
	}

})();
