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

	var clients,
		car,
		forwardVelocity = new THREE.Vector3(0, 0, 30),
		forwardTireSpin = new THREE.Vector3(5, 0, 0),
		backwardVelocity = new THREE.Vector3(0, 0, -30),
		backwardTireSpin = new THREE.Vector3(-5, 0, 0);

	function createWorld() {

		car = new hemi.Model(clients[0]);
		car.load({ modelFileName: 'assets/Ford_Mustang/Ford_Mustang.dae', convertUpAxis: true });

		hemi.subscribe(hemi.msg.ready,
			function(msg) {
				car.root.position.y = 20;
				car.root.updateMatrix();

				setupScene();
			});
		
		hemi.ready();
	}

	function setupScene() {
		var vp = new hemi.Viewpoint();
		vp.eye.set(302, 106, -196);
		vp.target.set(62, 0, 368);

		clients[0].camera.moveToView(vp, 2);

		vp = new hemi.ViewData();
		vp.eye.set(59, 31, 255);
		vp.target.set(33, 43, 0);
		clients[1].camera.moveToView(vp, 2);

		vp = new hemi.ViewData();
		vp.eye.set(211, 23, -31);
		vp.target.set(40, 12, -8);
		clients[2].camera.moveToView(vp, 2);

		vp = new hemi.ViewData();
		vp.eye.set(-100, 20, -221);
		vp.target.set(13, 41, 9);
		clients[3].camera.moveToView(vp, 2);
	}

	window.onload = function() {
		clients = hemi.makeClients({
			shared: {
				'kuda': [
					[0.5, 0.5, 0, 1],
					[0, 0.5, 0, 1/3],
					[0, 0.5, 1/3, 1/3],
					[0, 0.5, 2/3, 1/3]
				]
			}
		});

		clients[0].setBGColor(0x222222, 1);
		clients[1].setBGColor(0x222222, 1);
		clients[2].setBGColor(0x222222, 1);
		clients[3].setBGColor(0x222222, 1);

		clients[0].addGrid(2000, 100);

		clients[1].useCameraLight(false);
		clients[2].useCameraLight(false);
		clients[3].useCameraLight(false);

		hemi.input.addKeyDownListener({
			onKeyDown: function(evt) {
				switch (evt.keyCode) {
					case 65: //a
						//TODO: turn car
						break;
					case 68: //d
						//TODO: turn car
						break;
					case 83: //s
						car.root.setMoving(backwardVelocity);
						car.getTransform('Ford_Mustang-W_FL-node').setTurning(backwardTireSpin);
						car.getTransform('Ford_Mustang-W_FR-node').setTurning(backwardTireSpin);
						car.getTransform('Ford_Mustang-W_RL-node').setTurning(backwardTireSpin);
						car.getTransform('Ford_Mustang-W_RR-node').setTurning(backwardTireSpin);
						break;
					case 87: //w
						car.root.setMoving(forwardVelocity);
						car.getTransform('Ford_Mustang-W_FL-node').setTurning(forwardTireSpin);
						car.getTransform('Ford_Mustang-W_FR-node').setTurning(forwardTireSpin);
						car.getTransform('Ford_Mustang-W_RL-node').setTurning(forwardTireSpin);
						car.getTransform('Ford_Mustang-W_RR-node').setTurning(forwardTireSpin);
						break;
				}
			}
		});

		hemi.input.addKeyUpListener({
			onKeyUp: function(evt) {
				car.root.cancelMoving();
				car.getTransform('Ford_Mustang-W_FL-node').cancelTurning();
				car.getTransform('Ford_Mustang-W_FR-node').cancelTurning();
				car.getTransform('Ford_Mustang-W_RL-node').cancelTurning();
				car.getTransform('Ford_Mustang-W_RR-node').cancelTurning();
			}
		});

		hemi.loadPath = '../../';		
		createWorld();
	};
})();
