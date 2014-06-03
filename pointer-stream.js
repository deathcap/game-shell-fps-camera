'use strict';

var Readable = require('stream').Readable;
var inherits = require('inherits');

function PointerStream(opts) {
  opts.objectMode = true;
  Readable.call(this, opts);
  this.shell = opts.shell;
  if (!this.shell) throw new Error('PointerStream requires shell option set to game-shell instance');

  this.enable();
}

inherits(PointerStream, Readable);

PointerStream.prototype.enable = function() {
  this.shell.on('tick', this.onTick = this.tick.bind(this));
};

PointerStream.prototype.disable = function() {
  this.shell.removeListener('tick', this.onTick);
};


PointerStream.prototype.tick = function() {
  if (!this.shell.pointerLock) {
    return;
  }

  var dx = this.shell.prevMouseX - this.shell.mouseX;
  var dy = this.shell.prevMouseY - this.shell.mouseY;
  var dt = Date.now() - this.shell.startTime;

  this.push({dx:dx, dy:dy, dt:dt});
};

PointerStream.prototype._read = function() {
  // must implement, but don't add any updates on-demand
};

module.exports = PointerStream;
