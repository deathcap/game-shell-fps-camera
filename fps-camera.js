'use strict';

var glm = require('gl-matrix');
var vec3 = glm.vec3;
var createBasicCamera = require('basic-camera');

module.exports = function(game, opts) {
  return new CameraPlugin(game, opts);
}
module.exports.pluginInfo = {
  clientOnly: true
};

function CameraPlugin(game, opts) {
  this.shell = game.shell;

  opts = opts || {};
  this.enableFlight = opts.enableFlight !== undefined ? opts.enableFlight : true;

  this.camera = createBasicCamera();
  this.camera.lookAt = function(eye, center, up) { console.log(eye, center, up); }; // TODO: add to basic-camera, as in orbit-camera (https://github.com/hughsk/basic-camera/issues/5)
  // TODO: remove hardcoded position
  this.camera.position[0] = -20;
  this.camera.position[1] = -33;
  this.camera.position[2] = -40;

  this.max_dpitch = Math.PI / 2;
  this.max_dyaw = Math.PI / 2;
  this.scale = 0.0002;
  this.speed = 1.0;
  this.cameraVector = vec3.create();

  this.scratch0 = vec3.create();
  this.y_axis = vec3.fromValues(0, 1, 0);

  this.enable();
}


CameraPlugin.prototype.enable = function() {
  this.shell.bind('move-left', 'left', 'A');
  this.shell.bind('move-right', 'right', 'D');
  this.shell.bind('move-forward', 'up', 'W');
  this.shell.bind('move-back', 'down', 'S');
  this.shell.bind('move-up', 'space');
  this.shell.bind('move-down', 'shift');

  this.shell.on('tick', this.onTick = this.tick.bind(this));
};

CameraPlugin.prototype.disable = function() {
  this.shell.removeListener('tick', this.onTick);
  this.shell.unbind('move-left');
  this.shell.unbind('move-right');
  this.shell.unbind('move-forward');
  this.shell.unbind('move-back');
  this.shell.unbind('move-up');
  this.shell.unbind('move-down');
};

CameraPlugin.prototype.view = function(out) {
  return this.camera.view(out);
};

CameraPlugin.prototype.tick = function() {
    if (!this.shell.pointerLock) {
      return;
    }

    // movement relative to camera
    this.camera.getCameraVector(this.cameraVector);
    if (this.shell.wasDown('move-forward')) {
      vec3.scaleAndAdd(this.camera.position, this.camera.position, this.cameraVector, this.speed);
    }
    if (this.shell.wasDown('move-back')) {
      vec3.scaleAndAdd(this.camera.position, this.camera.position, this.cameraVector, -this.speed);
    }
    if (this.shell.wasDown('move-right')) {
      vec3.cross(this.scratch0, this.cameraVector, this.y_axis);
      vec3.scaleAndAdd(this.camera.position, this.camera.position, this.scratch0, this.speed);
    }
    if (this.shell.wasDown('move-left')) {
      vec3.cross(this.scratch0, this.cameraVector, this.y_axis);
      vec3.scaleAndAdd(this.camera.position, this.camera.position, this.scratch0, -this.speed);
    }

    // fly straight up or down
    if (this.enableFlight) {
      if (this.shell.wasDown('move-up')) {
        this.camera.position[1] -= 1;
      }
      if (this.shell.wasDown('move-down')) {
        this.camera.position[1] += 1;
      }
    }


    // mouselook
    var dx = this.shell.mouseX - this.shell.prevMouseX;
    var dy = this.shell.mouseY - this.shell.prevMouseY;
    var dt = this.shell.frameTime;
    //console.log(dx,dy,dt);

    var dpitch = dy / dt * this.scale;
    var dyaw = dx / dt * this.scale;

    if (dpitch > this.max_dpitch) dpitch = max_dpitch;
    if (dpitch < -this.max_dpitch) dpitch = -max_dpitch;
    if (dyaw > this.max_dyaw) dyaw = max_dyaw;
    if (dyaw < -this.max_dyaw) dyaw = -max_dyaw;

    //console.log(dpitch,dyaw);

    this.camera.rotateX(dpitch);
    this.camera.rotateY(dyaw);
};

