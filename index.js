'use strict';

var createBasicCamera = require('basic-camera');

var attachCamera = function(shell) {
  var camera = createBasicCamera([-22, -14, -48]); 

  shell.bind('move-left', 'left', 'A');
  shell.bind('move-right', 'right', 'D');
  shell.bind('move-forward', 'forward', 'W');
  shell.bind('move-back', 'back', 'S');
  shell.bind('move-up', 'up', 'space');
  shell.bind('move-down', 'down', 'shift');

  shell.on('tick', function() {
    if (shell.wasDown('move-left')) {
      camera.position[0] += 1;
    }
    if (shell.wasDown('move-right')) {
      camera.position[0] -= 1;
    }
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
  });

  camera.lookAt = function(eye, center, up) { console.log(eye, center, up); }; // TODO: add to basic-camera, as in orbit-camera

  window.camera = camera;
  window.shell = shell;

  return camera;
};

module.exports = attachCamera;

