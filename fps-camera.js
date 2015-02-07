'use strict';

var glm = require('gl-matrix');
var vec3 = glm.vec3;
var quat = glm.quat;
var createBasicCamera = require('basic-camera');
var PointerStream = require('./pointer-stream.js');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

module.exports = function(game, opts) {
  return new CameraPlugin(game, opts);
}
module.exports.pluginInfo = {
  //clientOnly: true // TODO: server-side support for storing camera location, without rendering?
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

  var q = this.q = quat.create();
  var axis = vec3.create();

  var translateOnAxis = function(x, y, z, distance) {
    vec3.set(axis, x, y, z);
    vec3.transformQuat(axis, axis, q);
    vec3.scaleAndAdd(camera.position, camera.position, axis, distance);
  };

  // three.js-like object for voxel-physical target
  this.player = {
    position: {},
    rotation: {},

    translateX: translateOnAxis.bind(null, -1, 0, 0),
    translateY: translateOnAxis.bind(null, 0, -1, 0),
    translateZ: translateOnAxis.bind(null, 0, 0, -1),
  };

  var offset = 1.5; // distance between camera pos (eyes) and player pos (feet), voxel-engine makePhysical envelope y TODO: stop hardcoding here..
  Object.defineProperty(this.player.position, 'x', { get:function() { return -camera.position[0]; }, set:function(v) { camera.position[0] = -v; }});
  Object.defineProperty(this.player.position, 'y', { get:function() { return -camera.position[1]-offset; }, set:function(v) { camera.position[1] = -v-offset; }});
  Object.defineProperty(this.player.position, 'z', { get:function() { return -camera.position[2]; }, set:function(v) { camera.position[2] = -v; }});

  var updateRotation = function() {
    // update Euler angles (order YXZ) to quaternion
    quat.identity(q);
    quat.rotateY(q, q, -camera.rotationY); // yaw
    //quat.rotateZ(q, q, camera.rotationZ); // roll always zero for now
    //quat.rotateX(q, q, camera.rotationX); // pitch should have no effect on WASD movement (otherwise, will bounce up when looking around and walking)
  };

  Object.defineProperty(this.player.rotation, 'x', { get:function() { return camera.rotationX; }, set:function(v) { camera.rotationX = v; updateRotation(); }});
  Object.defineProperty(this.player.rotation, 'y', { get:function() { return camera.rotationY; }, set:function(v) { camera.rotationY = v; updateRotation(); }});
  Object.defineProperty(this.player.rotation, 'z', { get:function() { return camera.rotationZ; }, set:function(v) { camera.rotationZ = v; updateRotation(); }});

  this.enable();
}
inherits(CameraPlugin, EventEmitter);

CameraPlugin.prototype.enable = function() {
  this.shell.bind('left', 'left', 'A');
  this.shell.bind('right', 'right', 'D');
  this.shell.bind('forward', 'up', 'W');
  this.shell.bind('backward', 'down', 'S');
  this.shell.bind('jump', 'space');
  this.shell.bind('crouch', 'shift');

  this.physics = this.game.makePhysical(this.player); // voxel-physical
  this.game.addItem(this.physics);
  this.physics.yaw = this.player;
  this.physics.pitch = this.player;//.head; TODO
  //this.physics.roll = this.player; // TODO: advanced rolling controls? (aircraft, flight?)
  this.physics.subjectTo(this.game.gravity);
  this.physics.blocksCreation = true;

  this.game.control(this.physics);

  this.pointerStream = new PointerStream({shell:this.shell});
  this.pointerStream.pipe(this.game.controls.createWriteRotationStream());
};

CameraPlugin.prototype.disable = function() {
  this.pointerStream.disable();
  this.shell.unbind('left');
  this.shell.unbind('right');
  this.shell.unbind('forward');
  this.shell.unbind('backward');
  this.shell.unbind('jump');
  this.shell.unbind('crouch');
};

CameraPlugin.prototype.view = function(out) {
  this.camera.view(out); // (note: returns out)
  // Allow other plugins to adjust the view matrix
  this.emit('view', out);
  return out;
};

CameraPlugin.prototype.getPosition = function(out) {
  // Negate since basic-camera considers -Y up (etc.), but we use +Y for up
  out[0] = -this.camera.position[0];
  out[1] = -this.camera.position[1];
  out[2] = -this.camera.position[2];
};

var _scratch1 = [0,0,0];
CameraPlugin.prototype.getVector = function(out) {
  this.camera.getCameraVector(_scratch1);
  out[0] = -_scratch1[0];
  out[1] = -_scratch1[1];
  out[2] = -_scratch1[2];
};
