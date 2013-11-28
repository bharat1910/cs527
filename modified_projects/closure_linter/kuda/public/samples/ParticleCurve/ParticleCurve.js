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

/**
 * This is a demo to show how to use the Kuda particle system, built on 
 *		top of the hello world demo.
 */
(function() {
	
	var client;
	
	function createWorld() {

		/**
		 * hemi.world is the default world created to manage all of our models,
		 *		cameras, effects, etc. When we set the model's file name, it
		 *		will begin loading that file.
		 */
		var house = new hemi.Model(client);				// Create a new Model
		house.setFileName('assets/house_v12/house_v12.dae'); // Set the model file
		
		/**
		 * When we call the 'ready' function, it will wait for the model to
		 *		finish loading and then it will send out a Ready message. Here
		 *		we register a handler, setupScene(), to be run when the message
		 *		is sent.
		 */
		hemi.subscribe(hemi.msg.ready,
			function(msg) {
				setupScene();
			});
		
		hemi.ready();   // Indicate that we are ready to start our script
	};
		
	function setupScene(house) {
		var vp = new hemi.Viewpoint();		// Create a new Viewpoint
		vp.eye = new THREE.Vector3(-10, 800, 1800);					// Set viewpoint eye
		vp.target = new THREE.Vector3(10, 250,30);					// Set viewpoint targetget

		/**
		 * Move the camera from it's default position (eye : [0,0,-1],
		 *		target : [0,0,0]} to the new viewpoint, and take 120
		 *		render cycles (~2 seconds) to do so.
		 */
		client.camera.moveToView(vp, 2.5);
		client.camera.enableControl();	// Enable camera mouse control
		
		/*
		 * The bounding boxes which the arrows will flow through:
		 */
		var box1 = new hemi.BoundingBox(new THREE.Vector3(-510,-110,-10),new THREE.Vector3(-490,-90,10));
		var box2 = new hemi.BoundingBox(new THREE.Vector3(-600,400,-200),new THREE.Vector3(-400,600,0));
		var box3 = new hemi.BoundingBox(new THREE.Vector3(-10,790,180),new THREE.Vector3(10,810,200));
		var box4 = new hemi.BoundingBox(new THREE.Vector3(400,450,-300),new THREE.Vector3(600,650,-100));
		var box5 = new hemi.BoundingBox(new THREE.Vector3(490,-110,-110),new THREE.Vector3(510,-90,-90));
		var box6 = new hemi.BoundingBox(new THREE.Vector3(-30,140,-560),new THREE.Vector3(30,260,-440));
		var box7 = new hemi.BoundingBox(new THREE.Vector3(-310,490,-10),new THREE.Vector3(110,510,10));
		var box8 = new hemi.BoundingBox(new THREE.Vector3(90,190,590),new THREE.Vector3(110,210,610));
		var box9 = new hemi.BoundingBox(new THREE.Vector3(-250,-250,270),new THREE.Vector3(-150,-150,330));
		
		/*
		 * The colors these arrows will be as they move along the curve:
		 */
		var blue = [0, 0, 1, 0.7];
		var green = [0, 1, 0, 0.7];
		var red = [1, 0, 0, 0.7];
		
		/* How much to scale these arrows as they move along the curve:
		 */
		var scaleKey1 = {key: 0, value: new THREE.Vector3(1,1,1)};
		var scaleKey2 = {key: 0.6, value: new THREE.Vector3(1,1,1)};
		var scaleKey3 = {key: 0.7, value: new THREE.Vector3(3,3,1)};  // Lengthen as they come over the roof
		var scaleKey4 = {key: 0.8, value: new THREE.Vector3(1,1,1)};
		var scaleKey5 = {key: 1, value: new THREE.Vector3(1,1,1)};
		
		/* Create a particle system configuration with the above parameters,
		 * plus a rate of 20 particles per second, and a lifetime of
		 * 5 seconds. Specify the shapes are arrows.
		 */
		var systemConfig = {
			aim: true,
			particleCount: 500,
			life: 12,
			boxes: [box1,box2,box3,box4,box5,box6,box7,box8,box9,box1],
			customMesh: hemi.createShape({
					shape: 'arrow',
					material: null,
					size: 10,
					tail: 5,
					depth: 10
				}),
			colors: [blue,green,red,blue],
			scaleKeys: [scaleKey1,scaleKey2,scaleKey3,scaleKey4,scaleKey5]
		};
		
		/* Create the particle system with the above config, 
		 * and make the root transform its parent.
		 */
		var particleSystem = new hemi.ParticleCurveTrail(client, systemConfig);
		var showBoxes = false;		// If boxes are being shown
		
		/* Register a keyDown listener:
		 * If a is pressed, increase the particle system rate
		 *		(it starts at the max rate)
		 * If z is pressed, decrease the particle system rate
		 * If space is pressed, toggle the bounding boxes
		 */
		hemi.input.addKeyDownListener({
			onKeyDown : function(event) {
				switch (event.keyCode) {
					case (32):
						if (showBoxes) {
							particleSystem.hideBoxes();
							showBoxes = false;
						} else {
							particleSystem.showBoxes();
							showBoxes = true;
						}
						break;
					case (65):
						var newLife = particleSystem.life - 1;
						
						if (newLife > 0) {
							particleSystem.life = newLife;
						}
						break;
					case (80):
						if (particleSystem.active) {
							particleSystem.pause();
						} else {
							particleSystem.play();
						}
						break;
					case (83):
						if (particleSystem.active) {
							particleSystem.stop();
						} else {
							particleSystem.start();
						}
						break;
					case (90):
						var newLife = particleSystem.life + 1;
						
						if (newLife < 30) {
							particleSystem.life = newLife;
						}
						break;
					default:
				}
			}
		});
		
	};

	window.onload = function() {
		/**
		 * It is possible to have multiple clients (i.e. multiple frames
		 * 		rendering 3d content) on one page that would have to be
		 * 		initialized. In this case, we only want to initialize the
		 *		first one.
		 */
		client = hemi.makeClients()[0];
		
		/**
		 * Set the background color to a light-bluish. The parameters are a hex
		 * 		code for the RGB values and an alpha value between 0 and 1.
		 */
		client.setBGColor(0xffffaa, 1);
		
		/**
		 * Set a prefix for the loader that will allow us to load assets as if
		 * the helloWorld.html file was in the root directory.
		 */
		hemi.loadPath = '../../';
		
		createWorld();
	};
})();
