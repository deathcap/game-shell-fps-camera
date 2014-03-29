'use strict';

var createBasicCamera = require('basic-camera');

var attachCamera = function(shell) {
  var camera = createBasicCamera([45, -14, 11]); //[80, 16-10, 16]);

  camera.rotateY(240 * Math.PI/180);

  shell.on('tick', function() {
    //r += 1;
    //camera.rotateY(1 * Math.PI/180);
    //console.log(r);
  });

  camera.lookAt = function(eye, center, up) { console.log(eye, center, up); }; // TODO: add to basic-camera, as in orbit-camera

  window.camera = camera;

  return camera;
};

module.exports = attachCamera;

