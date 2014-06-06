'use strict';

var glm = require('gl-matrix');
var vec3 = glm.vec3;
var createBasicCamera = require('basic-camera');
var PointerStream = require('./pointer-stream.js');

module.exports = function(game, opts) {
  return new CameraPlugin(game, opts);
}
module.exports.pluginInfo = {
  //clientOnly: true // TODO: server-side support for storing camera location, without rendering?
};

var proxyProp = function(o1, p1, o2, p2) {
  Object.defineProperty(o1, p1, {
    get:function() { return o2[p2]; },
    set:function(v) { o2[p2] = v; }
  });
};

function CameraPlugin(game, opts) {
  this.game = game;
  this.shell = game.shell;

  opts = opts || {};
  this.enableFlight = opts.enableFlight !== undefined ? opts.enableFlight : true;

  this.camera = createBasicCamera();
  this.camera.lookAt = function(eye, center, up) { console.log(eye, center, up); }; // TODO: add to basic-camera, as in orbit-camera (https://github.com/hughsk/basic-camera/issues/5)
  this.camera.position.set(opts.position || [0,-30,0]);
  this.camera.rotationX = opts.rotationX || 0.0;
  this.camera.rotationY = opts.rotationY || 0.0;
  this.camera.rotationZ = opts.rotationZ || 0.0;

  this.cameraVector = vec3.create();

  var camera = this.camera;
  // three.js-like object for voxel-physical target
  this.player = {
    position: {},
    rotation: {},
   
    translateX: function(dx) { camera.position[0] -= dx; },
    translateY: function(dy) { camera.position[1] -= dy; },
    translateZ: function(dz) { camera.position[2] -= dz; },
  };

  /*
  proxyProp(this.player.position, 'x', camera.position, 0);
  proxyProp(this.player.position, 'y', camera.position, 1);
  proxyProp(this.player.position, 'z', camera.position, 2);
  */
  Object.defineProperty(this.player.position, 'x', { get:function() { return -camera.position[0]; }, set:function(v) { camera.position[0] = -v; }});
  Object.defineProperty(this.player.position, 'y', { get:function() { return -camera.position[1]; }, set:function(v) { camera.position[1] = -v; }});
  Object.defineProperty(this.player.position, 'z', { get:function() { return -camera.position[2]; }, set:function(v) { camera.position[2] = -v; }});

  proxyProp(this.player.rotation, 'x', camera, 'rotationX');
  proxyProp(this.player.rotation, 'y', camera, 'rotationY');
  proxyProp(this.player.rotation, 'z', camera, 'rotationZ');

  this.enable();
}


CameraPlugin.prototype.enable = function() {
  this.shell.bind('left', 'left', 'A');
  this.shell.bind('right', 'right', 'D');
  this.shell.bind('forward', 'up', 'W');
  this.shell.bind('backward', 'down', 'S');
  this.shell.bind('jump', 'space');
  this.shell.bind('crouch', 'shift');
  this.shell.on('tick', this.onTick = this.tick.bind(this));

  this.physics = this.game.makePhysical(this.player); // voxel-physical
  this.game.addItem(this.physics);
  this.physics.yaw = this.player;
  this.physics.pitch = this.player;//.head;
  //this.physics.roll = this.player;
  this.physics.subjectTo(this.game.gravity);
  this.physics.blocksCreation = true;

  this.game.control(this.physics);

  this.pointerStream = new PointerStream({shell:this.shell});
  this.pointerStream.pipe(this.game.controls.createWriteRotationStream());
};

CameraPlugin.prototype.disable = function() {
  this.pointerStream.disable();
  this.shell.removeListener('tick', this.onTick);
  this.shell.unbind('left');
  this.shell.unbind('right');
  this.shell.unbind('forward');
  this.shell.unbind('backward');
  this.shell.unbind('jump');
  this.shell.unbind('crouch');
};

CameraPlugin.prototype.view = function(out) {
  return this.camera.view(out);
};

CameraPlugin.prototype.getPosition = function(out) {
  // Negate since basic-camera consider -Y up (etc.), but we use +Y for up
  // and swap X,Z due to differing conventions
  out[0] = -this.camera.position[2];
  out[1] = -this.camera.position[1];
  out[2] = -this.camera.position[0];
};

CameraPlugin.prototype.tick = function() {
  if (!this.shell.pointerLock) {
    return;
  }

  // TODO: reconcile with voxel-fly
  /*
  // fly straight up or down
  if (this.enableFlight) {
    if (this.shell.wasDown('jump')) {
      this.camera.position[1] -= 1;
    }
    if (this.shell.wasDown('crouch')) {
      this.camera.position[1] += 1;
    }
  }*/
};

