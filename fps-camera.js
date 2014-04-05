'use strict';

var glm = require('gl-matrix');
var vec3 = glm.vec3;

var createBasicCamera = require('basic-camera');

var scratch0 = vec3.create();
var y_axis = vec3.fromValues(0, 1, 0);

var enableFlight; // TODO: expose

var attachCamera = function(shell, opts) {
  var camera = createBasicCamera();

  opts = opts || {};
  enableFlight = opts.enableFlight !== undefined ? opts.enableFlight : true;

  shell.bind('move-left', 'left', 'A');
  shell.bind('move-right', 'right', 'D');
  shell.bind('move-forward', 'forward', 'W');
  shell.bind('move-back', 'back', 'S');
  shell.bind('move-up', 'up', 'space');
  shell.bind('move-down', 'down', 'shift');

  var max_dpitch = Math.PI / 2;
  var max_dyaw = Math.PI / 2;
  var scale = 0.0002;
  var speed = 1.0;
  var cameraVector = vec3.create();

  shell.on('tick', function() {
    if (!shell.pointerLock) {
      return;
    }

    // movement relative to camera
    camera.getCameraVector(cameraVector);
    if (shell.wasDown('move-forward')) {
      vec3.scaleAndAdd(camera.position, camera.position, cameraVector, speed);
    }
    if (shell.wasDown('move-back')) {
      vec3.scaleAndAdd(camera.position, camera.position, cameraVector, -speed);
    }
    if (shell.wasDown('move-right')) {
      vec3.cross(scratch0, cameraVector, y_axis);
      vec3.scaleAndAdd(camera.position, camera.position, scratch0, speed);
    }
    if (shell.wasDown('move-left')) {
      vec3.cross(scratch0, cameraVector, y_axis);
      vec3.scaleAndAdd(camera.position, camera.position, scratch0, -speed);
    }

    // fly straight up or down
    if (enableFlight) {
      if (shell.wasDown('move-up')) {
        camera.position[1] -= 1;
      }
      if (shell.wasDown('move-down')) {
        camera.position[1] += 1;
      }
    }


    // mouselook
    var dx = shell.mouseX - shell.prevMouseX;
    var dy = shell.mouseY - shell.prevMouseY;
    var dt = shell.frameTime;
    //console.log(dx,dy,dt);

    var dpitch = dy / dt * scale;
    var dyaw = dx / dt * scale;

    if (dpitch > max_dpitch) dpitch = max_dpitch;
    if (dpitch < -max_dpitch) dpitch = -max_dpitch;
    if (dyaw > max_dyaw) dyaw = max_dyaw;
    if (dyaw < -max_dyaw) dyaw = -max_dyaw;

    //console.log(dpitch,dyaw);

    camera.rotateX(dpitch);
    camera.rotateY(dyaw);
  });

  camera.lookAt = function(eye, center, up) { console.log(eye, center, up); }; // TODO: add to basic-camera, as in orbit-camera (https://github.com/hughsk/basic-camera/issues/5)

  window.camera = camera;
  window.shell = shell;

  return camera;
};

module.exports = attachCamera;

