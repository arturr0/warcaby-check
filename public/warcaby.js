let pawn;
let targetPos;
var socket = io.connect('http://localhost:3000');

function Pawn(x, y, r) {
  this.pos = createVector(x, y);
  this.r = r;
  this.speed = 10;

  this.update = function() {
    if (targetPos) {
      let vel = targetPos.copy().sub(this.pos);

      if (vel.mag() > this.speed) {
        vel.setMag(this.speed);
        this.pos.add(vel);
      } else {
        this.pos = targetPos;
        targetPos = null;
      }
    }
  }

  this.show = function() {
    fill(255);
    circle(this.pos.x, this.pos.y, this.r * 2);
  }
}

socket.on('animate', function(newPos) {
  targetPos = createVector(newPos.x, newPos.y); // Ensure newPos is a p5.Vector
});

function setup() {
  let canvas = createCanvas(500, 500);
  canvas.parent('sketch-holder');
  pawn = new Pawn(20, 20, 20);
  targetPos = createVector(pawn.pos.x, pawn.pos.y);
}

function draw() {
  background(0);
  pawn.update();
  pawn.show();
}

function mouseClicked() {
  targetPos = createVector(mouseX, mouseY);
  socket.emit('move', { x: targetPos.x, y: targetPos.y }); // Send plain object, not p5.Vector
}
