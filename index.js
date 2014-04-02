'use strict';

var glm = require('gl-matrix');
var vec3 = glm.vec3;

var createBasicCamera = require('basic-camera');

var scratch0 = vec3.create();

var attachCamera = function(shell) {
  var camera = createBasicCamera([-22, -14, -48]); 

  shell.bind('move-left', 'left', 'A');
  shell.bind('move-right', 'right', 'D');
  shell.bind('move-forward', 'forward', 'W');
  shell.bind('move-back', 'back', 'S');
  shell.bind('move-up', 'up', 'space');
  shell.bind('move-down', 'down', 'shift');
  shell.bind('test', 'R');

  var max_dpitch = Math.PI / 2;
  var max_dyaw = Math.PI / 2;
  var scale = 0.0002;

  shell.on('tick', function() {
    if (!shell.pointerLock) {
      return;
    }

    if (shell.wasDown('move-left')) {
      camera.position[0] += 1;
    }
    if (shell.wasDown('move-right')) {
      camera.position[0] -= 1;
    }
    // TODO: option to disable flying
    if (shell.wasDown('move-up')) {
      camera.position[1] -= 1;
    }
    if (shell.wasDown('move-down')) {
      camera.position[1] += 1;
    }
    if (shell.wasDown('move-forward')) {
      camera.position[2] += 1;
    }
    if (shell.wasDown('move-back')) {
      camera.position[2] -= 1;
    }
    if (shell.wasDown('test')) {
      // TODO: replace move-forward with this, after it works - goes in wrong direction
      vec3.scaleAndAdd(camera.position, camera.position, camera.cameraVector, 1.0);
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

    // TODO: fix unintentional rolling
    camera.rotateX(dpitch);
    camera.rotateY(dyaw);
  });

  camera.lookAt = function(eye, center, up) { console.log(eye, center, up); }; // TODO: add to basic-camera, as in orbit-camera

  window.camera = camera;
  window.shell = shell;

  return camera;
};

module.exports = attachCamera;

