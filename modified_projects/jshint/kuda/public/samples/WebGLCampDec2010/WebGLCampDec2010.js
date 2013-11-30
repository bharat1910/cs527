/* jshint undef: false, unused: false, asi: true */
/*
 * Kuda includes a library and editor for authoring interactive 3D content for the web.
 *  Copyright (C) 2011 SRI International.
 *
 *  This program is free software; you can redistribute it and/or modify it under the terms
 *  of the GNU General Public License as published by the Free Software Foundation; either 
 *  version 2 of the License, or (at your option) any later version.
 * 
 *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
 *  See the GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License along with this program; 
 *  if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, 
 *  Boston, MA 02110-1301 USA.
 */

(function() {
	hemi.loadPath = '../../';
	var client,
		SLIDE1_EYE = new THREE.Vector3(0, 0, 9470),
		SLIDE1_TARGET = new THREE.Vector3(0, 0, 8000),
		SLIDE_1Z = 9000,
		currentSlide = 1,
		slides = [{
			url: 'assets/images/Slide01.png',
			vector: [0, 0, SLIDE_1Z]
		}, {
			url: 'assets/images/Slide02.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide03.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide04.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide05.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide06.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide07.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide08.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide09.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide10.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide11.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide12.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide13.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide14.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide15.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide16.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide17.png',
			vector: [0, -1000, 0]
		}, {
			url: 'assets/images/Slide18.png',
			vector: [0, -1000, 0]
		}],
		loadedSlideCount = 0,
		digDisp,
		vp = new hemi.Viewpoint({
				eye:	SLIDE1_EYE,
				target:	SLIDE1_TARGET,
				fov:	Math.PI / 3,
				fp:		40000
			}),
		tangents = [
			new THREE.Vector3(0, -100, 0), new THREE.Vector3(0, 0, -100),
			new THREE.Vector3(0, 0, -100), new THREE.Vector3(0, -100, 0)
		],
		dispDigits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		shapeNdx = [1, 7, 5, 4, 2, 8, 3, 6, 9],
		world = hemi.world,
		core = hemi.core,
		view = hemi.view,
		input = hemi.input,
		thirty = Math.PI / 6,
		sixty = Math.PI / 3,
		listNdx = null,
		pbar = null,
		camera = null;
		
	function createWorld() {
		digDisp = new hemi.Model(client);
		digDisp.setFileName('assets/DigitalDisplay/DigitalDisplay.dae');	// Set the model file
		/**
		 * When we call the 'ready' function, it will wait for the model to
		 *		finish loading and then it will send out a Ready message. Here
		 *		we register a handler, setupScene(), to be run when the message
		 *		is sent.
		 */
		hemi.subscribe(hemi.msg.ready,
			function(msg) {
				makeSlide(0, slides[0]);
			});
		
		hemi.ready();   // Indicate that we are ready to start our script
	};

	function onSlideLoad(index, sprite) {
		loadedSlideCount++;

		if (loadedSlideCount === slides.length) {
			setupScene();
		}
	}

	function makeSlide(index, slide) {
		if (index < slides.length) {
			var geom = new THREE.PlaneGeometry(720, 540), 
				image = THREE.ImageUtils.loadTexture(hemi.loadPath + slide.url, null, function() {
					onSlideLoad(index, panel);
				}),
				material = new THREE.MeshBasicMaterial({ map: image }),
				panel = new THREE.Mesh(geom, material);
			client.scene.add(panel);
			slide.transform = panel;

			if (index) {
				slides[index - 1].transform.add(panel);
			} else {
				panel.rotation.x = hemi.HALF_PI;
			}

			panel.translateX(slide.vector[0]);
			panel.translateY(slide.vector[1]);
			panel.translateZ(slide.vector[2]);
			index++;
			makeSlide(index, slides[index]);
		}
	}

	function setupScene() {
		camera = client.camera;
		var material = new THREE.MeshPhongMaterial({
				color: 0xff77ff
			}),
			shape = new THREE.PlaneGeometry(20000, 20000),
			transform = new THREE.Mesh(shape, material);
		client.scene.add(transform);
		transform.translateY(-270);

		makeOcta(new THREE.Vector3(1700, -120, 8000), 300);
		makeOcta(new THREE.Vector3(-900, -120, 0), 200);
		makePyramid(new THREE.Vector3(-3200, 480, -7400));
		makeCylinder(new THREE.Vector3(-4200, 330, 7500 ));
		makeGiantCube(new THREE.Vector3(-6400, 1730, -5000));
		makeGiantCube(new THREE.Vector3(5000, 1730, -4000));
		makeGiantCube(new THREE.Vector3(5600, 1730, 5000));
		makeBigCube(new THREE.Vector3(2000, 230, 4000));
		makeBigCube(new THREE.Vector3(-3000, 230, -2000));
		makeBigCube(new THREE.Vector3(-6000, 230, 6000));
		makeBigBox(new THREE.Vector3(1500, -145, 0));
		makeBigBox(new THREE.Vector3(-2000, -145, 7500));
		makeCubeStack3(new THREE.Vector3(-2200, -170, 300));
		makeCubeStack3(new THREE.Vector3(-3500, -170, 4100));
		makeCubeStack3(new THREE.Vector3(-600, -170, 8300));

		digDisp.root.scale.set(2, 2, 2);
		digDisp.root.position.set(328, 240, SLIDE_1Z + 990);
		digDisp.root.updateMatrix();
		updateDigDisp(0, 1);

		camera.moveToView(vp, 0);
		camera.enableControl();
		var tout = setTimeout(function() {
			var msgH = camera.subscribe(hemi.msg.stop, moveOnRails),
				keyL = {
					onKeyDown: function(e) {
						camera.unsubscribe(msgH);
						input.removeKeyDownListener(keyL);
						camera.onCurve = false;
						camera.moveToView(vp, 0);
					}
				};
			input.addKeyDownListener(keyL);
			moveOnRails();
		}, 5000);
		var msgH = camera.subscribe(hemi.msg.stop, function() {
			camera.unsubscribe(msgH);

			input.addKeyDownListener({
				onKeyDown: function(e) {
					clearTimeout(tout);

					if (e.keyCode === 32 || e.keyCode === 38 || e.keyCode === 39) {
						currentSlide++;
						updateDigDisp(0, 1);
						moveCameraToSlide(currentSlide);
					} else if (e.keyCode === 37 || e.keyCode === 40) {
						currentSlide--;
						updateDigDisp(0, -1);
						moveCameraToSlide(0);
					} else if (e.keyCode === 84) {
						moveOnRails();
					}
				}
			});
		});
	}

	function updateDigDisp(ndx, upOrDown) {
		hemi.utils.translateUVs(digDisp.geometries[ndx], 0.1 * upOrDown, 0);
		dispDigits[ndx] = (dispDigits[ndx] + upOrDown) % 10;
		if (dispDigits[ndx] < 0) dispDigits[ndx] = 9;

		if ((dispDigits[ndx] == 0 && upOrDown == 1) || (dispDigits[ndx] == 9 && upOrDown == -1)) {
			if (ndx < 9) updateDigDisp(shapeNdx[ndx], upOrDown);
		} else {
			digDisp.root.position.z -= 1000 * upOrDown;
			digDisp.root.updateMatrix();
		}
	}

	function moveOnRails() {
		var eyes = [
				new THREE.Vector3(SLIDE1_EYE.x, SLIDE1_EYE.y, SLIDE1_EYE.z), 
				new THREE.Vector3(800, 0, SLIDE1_EYE.z),
				new THREE.Vector3(2800, 0, 4900),
				new THREE.Vector3(1500, 2000, -9000),
				new THREE.Vector3(-1200, 100, -9000), 
				new THREE.Vector3(-2000, 800, 0),
				new THREE.Vector3(-1000, 300, SLIDE1_EYE.z),
				new THREE.Vector3(SLIDE1_EYE.x, SLIDE1_EYE.y, SLIDE1_EYE.z)
			],
			targets = [
				new THREE.Vector3(SLIDE1_TARGET.x, SLIDE1_TARGET.y, SLIDE1_TARGET.z),
				eyes[2], eyes[3],
				eyes[4], eyes[5],
				eyes[6], eyes[7],
				new THREE.Vector3(SLIDE1_TARGET.x, SLIDE1_TARGET.y, SLIDE1_TARGET.z)
			],
			curveEye = new hemi.Curve(eyes, hemi.CurveType.Cardinal),
			curveTarget = new hemi.Curve(targets, hemi.CurveType.Cardinal),
			camCurve = new hemi.CameraCurve(curveEye, curveTarget);

		// curveEye.draw(50, client, { edgeSize: 5, edgeColor: 0x000000 });
		camera.moveOnCurve(camCurve, 25);
	}

	function moveCameraToSlide(slide) {
		if (slide === 0) {
			var offset = (currentSlide - 1) * 1000;
			vp.eye = new THREE.Vector3(0, 0, SLIDE1_EYE.z - offset);
			vp.target = new THREE.Vector3(0, 0, SLIDE1_TARGET.z - offset);
			camera.onCurve = false;
			camera.moveToView(vp, 0);
		} else {
			var offset = (slide - 2) * 1000,
				Za = SLIDE1_EYE.z - offset,
				Zb = Za - 170,
				Zc = Zb - 600,
				Zd = Za - 1000,
				Zt = SLIDE1_TARGET.z - offset,
				eyes = [
					new THREE.Vector3(0, 0, Za),
					new THREE.Vector3(0, 400, Zb),
					new THREE.Vector3(0, 400, Zc),
					new THREE.Vector3(0, 0, Zd)
				],
				targets = [
					new THREE.Vector3(0, 0, Zt),
					new THREE.Vector3(0, 0, Zt)
				],
			curveEye = new hemi.Curve(eyes, hemi.CurveType.CubicHermite, { tangents: tangents }),
			curveTarget = new hemi.Curve(targets, hemi.CurveType.Linear),
			camCurve = new hemi.CameraCurve(curveEye, curveTarget);
			// curveEye.draw(50, client, { edgeSize: 5, edgeColor: 0x000000 });
			camera.moveOnCurve(camCurve, 1.2);
		}
	}

	function makeOcta(vector, size) {
		var shape = hemi.createShape({
			shape: 'octa',
			color: randomColor(),
			size: size});

		shape.position.addSelf(vector);
		shape.updateMatrix();
		client.scene.add(shape);
	}

	function makePyramid(vector) {
		var pyr = hemi.createShape({
			shape: 'pyramid',
			color: randomColor(),
			h: 1500, w: 2000, d: 2000});

		pyr.rotation.y += sixty;
		pyr.position.addSelf(vector);
		pyr.updateMatrix();
		client.scene.add(pyr);
	}

	function makeCylinder(vector) {
		var shape = hemi.createShape({
			shape: 'cylinder',
			color: randomColor(),
			r: 500, h: 1200});

		shape.position.addSelf(vector);
		shape.updateMatrix();
		client.scene.add(shape);
	}

	function makeGiantCube(vector) {
		var cube = hemi.createShape({
			shape: 'cube', 
			color: randomColor(), 
			size: 4000 });

		cube.rotation.y += thirty;
		cube.position.addSelf(vector);
		cube.updateMatrix();
		client.scene.add(cube);
	}

	function makeBigCube(vector) {
		var cube = hemi.createShape({
			shape: 'cube', 
			color: randomColor(), 
			size: 1000 });

		cube.rotation.y += sixty;
		cube.position.addSelf(vector);
		cube.updateMatrix();
		client.scene.add(cube);
	}

	function makeBigBox(vector) {
		var box = hemi.createShape({
			shape: 'box',
			color: randomColor(),
			h: 250, w: 1500, d: 500 });

		box.rotation.y += thirty;
		box.position.addSelf(vector);
		box.updateMatrix();
		client.scene.add(box);
	}

	function makeCubeStack3(vector) {
		var cubea = hemi.createShape({
				shape: 'cube', 
				color: randomColor(), 
				size: 200 }),
			cubeb = hemi.createShape({
				shape: 'cube', 
				color: randomColor(), 
				size: 100 }),
			cubec = hemi.createShape({
				shape: 'cube', 
				color: randomColor(), 
				size: 50 });

		cubea.rotation.y += thirty;
		cubea.position.addSelf(vector);
		cubea.updateMatrix();
		client.scene.add(cubea);

		cubeb.rotation.y += thirty;
		cubeb.position.addSelf(new THREE.Vector3(20, 150, 0));
		cubeb.updateMatrix();
		cubea.add(cubeb);

		cubec.rotation.y += thirty;
		cubec.position.addSelf(new THREE.Vector3(0, 75, 10));
		cubec.updateMatrix();
		cubeb.add(cubec);
	}
	
	function randomColor() {
		return parseInt(Math.floor(Math.random()*16777215).toString(16), 16);
	}
	
	window.onload = function() {
		/**
		 * It is possible to have multiple clients (i.e. multiple frames
		 * 		rendering 3d content) on one page that would have to be
		 * 		initialized. In this case, we only want to initialize the
		 *		first one.
		 */
		client = hemi.makeClients()[0];
		
		/**
		 * Set the background color to white. The parameters are a hex
		 * 		code for the RGB values and an alpha value between 0 and 1.
		 */
		client.setBGColor(0xffffff, 1);
		
		createWorld();
	}
})();
