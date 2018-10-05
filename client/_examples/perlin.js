// Generated by CoffeeScript 1.3.3
var TAU, button, canvas, ctx, draw, f, fpselem, h, p1, particles, period, raf, w, _i;

canvas = document.getElementsByTagName('canvas')[0];

fpselem = document.getElementById('fps');

w = canvas.width = 1440;

h = canvas.height = 900;

TAU = 2 * Math.PI;

ctx = canvas.getContext('2d');

period = 1 / 800;

ctx.fillStyle = 'white';

ctx.fillRect(0, 0, w, h);

ctx.fillStyle = 'rgba(1,1,1,0.3)';

noise.seed(Math.random());

particles = [];

for (_i = 1; _i <= 2000; _i++) {
  p1 = {
    x: Math.random() * w,
    y: h / 2 + Math.random() * 50,
    a: 0
  };
  particles.push(p1);
  particles.push({
    x: p1.x,
    y: p1.y,
    // it seems like `a` is just to put it on the opposite side of a circle,
    // oh right, so it makes two different opposing particle streams :)
    a: TAU / 2
  });
}

draw = function() {
  var a, p, v, _j, _len, _results;
  _results = [];
  for (_j = 0, _len = particles.length; _j < _len; _j++) {
    p = particles[_j];
    // `v` is not velocity, it's a noise value based on position
    v = noise.perlin2(p.x * period, p.y * period);
    // hue is based on noise value
    ctx.fillStyle = "hsla(" + (Math.floor(v * 360)) + ", 95%, 20%, 0.05)";
    ctx.fillRect(p.x, p.y, 1.5, 1.5);
    // `h` doesn't seem to be used for anything, coffeescript garbage?
    p.h++;
    // multiply angle by noise
    a = v * 2 * Math.PI + p.a;
    // angle basically becomes velocity vector
    p.x += Math.cos(a);
    _results.push(p.y += Math.sin(a));
  }
  return _results;
};

raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
  return window.setTimeout(callback, 1000 / 60);
};

button = document.getElementsByTagName('input')[0];

button.onclick = function() {
  return window.open(canvas.toDataURL('image/png'));
};

f = function() {
  raf(f);
  return draw();
};

raf(f);