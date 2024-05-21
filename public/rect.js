var socket = io.connect('http://localhost:3000');

let Board = [];
let freeBoard;

function Area(rectCenter, rectCenterY, row, column, isBlack, free) {
  this.rectCenter = rectCenter;
  this.rectCenterY = rectCenterY;
  this.row = row;
  this.column = column;
  this.isBlack = isBlack;
  this.free = free;
}

let areaCenter = 60;
let row = 0;
let column = 0;

let targetPos;
let movingPawn = null;
let pawnCompletedMove = false;
let isPawnMoving = false;

let killer = "";

let Pawns = [];

let Greenturn = false;
let turn;

function Pawn(rectCenter, rectCenterY, row, column, isRed, queen, live) {
  this.rectCenter = rectCenter;
  this.rectCenterY = rectCenterY;
  this.row = row;
  this.column = column;
  this.isRed = isRed;
  this.queen = queen;
  this.live = true;
  this.pos = createVector(rectCenter, rectCenterY);
  this.targetPos = null;
  this.update = function() {
    if (this.targetPos) {
      let vel = p5.Vector.sub(this.targetPos, this.pos);
      if (vel.mag() > 10) {
        vel.setMag(10);
        this.pos.add(vel);
      } else {
        this.pos = this.targetPos.copy();
        this.targetPos = null;
        this.rectCenter = this.pos.x;
        this.rectCenterY = this.pos.y;
        pawnCompletedMove = true; // Mark the move as completed
      }
    }
  };

  this.show = function() {
    fill(this.isRed ? 'red' : 'green');
    circle(this.pos.x, this.pos.y, 50);
  };
}

let X;
let Y;
let pawnSelected = false;
let pawnPlayed;

socket.on('animate', function(data, TURN) {
  let newPos = createVector(data.x, data.y);
  let targetPawn = Pawns.find(pawn => pawn.rectCenter === data.oldX && pawn.rectCenterY === data.oldY);
  if (targetPawn) {
    targetPawn.targetPos = newPos;
    movingPawn = targetPawn;
  }
});

socket.on('new state', function(BOARD, PAWNS, TURN) {
  for (let i = 0; i < BOARD.length; i++) {
    Board[i].free = BOARD[i].free;
    Board[i].row = BOARD[i].row;
    Board[i].column = BOARD[i].column;
  }
  for (let i = 0; i < PAWNS.length; i++) {
    Pawns[i].row = PAWNS[i].row;
    Pawns[i].column = PAWNS[i].column;
    Pawns[i].live = PAWNS[i].live;
  }
});

socket.on('kill state response', function(BOARD, TURN, PAWNS) {
  for (let i = 0; i < BOARD.length; i++) {
    Board[i].free = BOARD[i].free;
    Board[i].row = BOARD[i].row;
    Board[i].column = BOARD[i].column;
  }
  for (let i = 0; i < PAWNS.length; i++) {
    Pawns[i].row = PAWNS[i].row;
    Pawns[i].column = Pawns[i].column;
    Pawns[i].live = PAWNS[i].live;
  }
});

function setup() {
  const myCanvas = createCanvas(544, 544);
  myCanvas.parent('game');
  turn = select('#turn');
  killer = select('#kill');
  rectMode(CENTER);
  background(220);

  let isBlack = true;

  for (let i = 0; i < 8; i++) {
    row++;
    column = 0;
    isBlack = !isBlack;

    for (let j = 0; j < 8; j++) {
      let rectCenter = column * 68 + 34;
      column++;
      let area = new Area(rectCenter, row * 68 - 34, row, column, isBlack, true);
      Board.push(area);
      
      isBlack = !isBlack;
    }
  }

  for (let j = 0; j < Board.length; j++) {
    if (Board[j].isBlack && Board[j].row < 4) {
      Board[j].free = false;
      let pawn = new Pawn(Board[j].rectCenter, Board[j].row * 68 - 34, Board[j].row, Board[j].column, true, false);
      Pawns.push(pawn);
    } else if (Board[j].isBlack && Board[j].row > 5) {
      Board[j].free = false;
      let pawn = new Pawn(Board[j].rectCenter, Board[j].row * 68 - 34, Board[j].row, Board[j].column, false, false);
      Pawns.push(pawn);
    }
  }
}

function draw() {
  turn.value(Greenturn);
  if (Greenturn) document.getElementById("turn").style.color = "green";
  else document.getElementById("turn").style.color = "red";
  background(220);

  for (let i = 0; i < Board.length; i++) {
    let color = Board[i].isBlack ? 0 : 255;
    fill(color);
    rect(Board[i].rectCenter, Board[i].rectCenterY, 68, 68);
  }

  for (let i = 0; i < Pawns.length; i++) {
    if (Pawns[i] !== movingPawn && Pawns[i].live) {
      Pawns[i].show();
    }
  }

  if (movingPawn) {
    movingPawn.update();
    movingPawn.show();
  }

  if (pawnCompletedMove) {
    movingPawn = null; // Reset movingPawn after completing the move
    pawnCompletedMove = false;
    isPawnMoving = false;
    Greenturn = !Greenturn;
    
  }
  kill();
  for (let i = 0; i < Board.length; i++)
    if (Board[i].free && Board[i].isBlack) {
      stroke(255);
      noFill();
      rect(Board[i].rectCenter, Board[i].rectCenterY, 55, 55);
    }
}

function mouseClicked() {
  X = mouseX;
  Y = mouseY;

  // Check if a pawn is clicked
  for (let i = 0; i < Pawns.length; i++) {
    let p = Pawns[i];
    if (((p.isRed && !Greenturn) || (!p.isRed && Greenturn)) && p.live &&
        X > p.rectCenter - 34 && X < p.rectCenter + 34 && Y > p.rectCenterY - 34 && Y < p.rectCenterY + 34) {
      pawnSelected = true;
      pawnPlayed = i;
      return;
    }
  }

  for (let k = 0; k < Board.length; k++) {
    if (Pawns[pawnPlayed].row == Board[k].row && Pawns[pawnPlayed].column == Board[k].column && Pawns[pawnPlayed].live) {
      freeBoard = k;
    }
  }

  // Check if a valid move is made
  if (pawnSelected) {
    for (let j = 0; j < Board.length; j++) {
      if (Board[j].isBlack && X > Board[j].rectCenter - 34 && X < Board[j].rectCenter + 34 &&
          Y > Board[j].rectCenterY - 34 && Y < Board[j].rectCenterY + 34 &&
          Board[j].isBlack && Board[j].free &&
          ((Pawns[pawnPlayed].isRed && Pawns[pawnPlayed].row - Board[j].row == -1 &&
            (Pawns[pawnPlayed].column - Board[j].column == 1 || Pawns[pawnPlayed].column - Board[j].column == -1)) ||
           (!Pawns[pawnPlayed].isRed && Pawns[pawnPlayed].row - Board[j].row == 1 &&
            (Pawns[pawnPlayed].column - Board[j].column == 1 || Pawns[pawnPlayed].column - Board[j].column == -1)))) {
        Board[freeBoard].free = true;
        targetPos = createVector(Board[j].rectCenter, Board[j].rectCenterY);
        let movingPawnOldPos = { x: Pawns[pawnPlayed].rectCenter, y: Pawns[pawnPlayed].rectCenterY };
        Pawns[pawnPlayed].targetPos = targetPos;
        movingPawn = Pawns[pawnPlayed];
        Pawns[pawnPlayed].row = Board[j].row;
        Pawns[pawnPlayed].column = Board[j].column;
        Board[j].free = false;
        socket.emit('state', Board, Pawns); // Send the move to the server
        socket.emit('move', { x: targetPos.x, y: targetPos.y, oldX: movingPawnOldPos.x, oldY: movingPawnOldPos.y }); // Send the move to the server
        pawnSelected = false;
        isPawnMoving = true;
        //Greenturn = !Greenturn;
      }
    }
  }
}
let playerHasKill = false;
let multipleKillCond = false;
//let multipleKillCondGreen = false;
let previousPlayer = null;

function kill() {
  if (isPawnMoving) return; // Prevent further actions while a pawn is moving
  let killConditions = [];
  for (let j = 0; j < Pawns.length; j++) {
    for (let k = 0; k < Pawns.length; k++) {
      if (Pawns[j].isRed != Pawns[k].isRed && Pawns[j].live && Pawns[k].live && 
          ((Greenturn == false && Pawns[j].isRed == false) || (Greenturn == true && Pawns[j].isRed == true)) &&
          ((Pawns[k].row - Pawns[j].row == 1 && Pawns[k].column - Pawns[j].column == 1))) {
        for (let i = 0; i < Board.length; i++) {
          if (Pawns[j].row - Board[i].row == 1 && Pawns[j].column - Board[i].column == 1 && Board[i].free) {
            killSwitch(k, j, i);
            playerHasKill = true;
             
          }
        }
      }
      if (Pawns[j].isRed != Pawns[k].isRed && Pawns[j].live && Pawns[k].live && 
          ((Greenturn == false && Pawns[j].isRed == false) || (Greenturn == true && Pawns[j].isRed == true)) &&
          ((Pawns[k].row - Pawns[j].row == 1 && Pawns[k].column - Pawns[j].column == -1))) {
        for (let i = 0; i < Board.length; i++) {
          if (Pawns[j].row - Board[i].row == 1 && Pawns[j].column - Board[i].column == -1 && Board[i].free) {
            killSwitch(k, j, i);
            playerHasKill = true;
          }
        }
      }
      if (Pawns[j].isRed != Pawns[k].isRed && Pawns[j].live && Pawns[k].live && 
          ((Greenturn == false && Pawns[j].isRed == false) || (Greenturn == true && Pawns[j].isRed == true)) &&
          ((Pawns[k].row - Pawns[j].row == -1 && Pawns[k].column - Pawns[j].column == 1))) {
        for (let i = 0; i < Board.length; i++) {
          if (Pawns[j].row - Board[i].row == -1 && Pawns[j].column - Board[i].column == 1 && Board[i].free) {
            killSwitch(k, j, i);
            playerHasKill = true;
          }
        }
      }
      if (Pawns[j].isRed != Pawns[k].isRed && Pawns[j].live && Pawns[k].live && 
          ((Greenturn == false && Pawns[j].isRed == false) || (Greenturn == true && Pawns[j].isRed == true)) &&
          ((Pawns[k].row - Pawns[j].row == -1 && Pawns[k].column - Pawns[j].column == -1))) {
        for (let i = 0; i < Board.length; i++) {
          if (Pawns[j].row - Board[i].row == -1 && Pawns[j].column - Board[i].column == -1 && Board[i].free) {
            killSwitch(k, j, i);
            playerHasKill = true;
          }
        }
      }
    }
  }
  
    // Execute kill switch for each condition
    //let previousPlayer;
    //killConditions.forEach(condition => {
      // if (previousPlayer !== null && condition.player !== previousPlayer) {
      //   previousPlayer = condition.player;
      //   multipleKillCond = false;
      //   console.log("no multipleKillCond");

      // } else {
      //   previousPlayer = condition.player;
      //   multipleKillCond = true;
      //   console.log("multipleKillCond");
        
        
      // }
        //killSwitch(condition.winner, condition.looser, condition.newBoard, condition.player);
    //});
    // Reset the flag for the next player
    //playerHasKill = false;
  
}

// k j i

function killSwitch(winner, looser, newBoard) {
  for (let m = 0; m < Board.length; m++)
    if (Board[m].row == Pawns[winner].row && Board[m].column == Pawns[winner].column) Board[m].free = true;
  for (let m = 0; m < Board.length; m++)
    if (Board[m].row == Pawns[looser].row && Board[m].column == Pawns[looser].column) Board[m].free = true;
  let targetPos = createVector(Board[newBoard].rectCenter, Board[newBoard].rectCenterY);
  let movingPawnOldPos = { x: Pawns[winner].rectCenter, y: Pawns[winner].rectCenterY };
  Pawns[winner].targetPos = targetPos;
  movingPawn = Pawns[winner];
  Pawns[winner].row = Board[newBoard].row;
  Pawns[winner].column = Board[newBoard].column;
  Pawns[looser].live = false;
  Board[newBoard].free = false;
  //pawnSelected = false;
  //isPawnMoving = true;
  //Pawns.splice(looser, 1)
  if (Pawns[winner].isRed) {killer.value("RED"); document.getElementById("kill").style.color = "red";}
  else if (!Pawns[winner].isRed) {killer.value("GREEN"); document.getElementById("kill").style.color = "green";}
  //Greenturn = !Greenturn;
  socket.emit('kill state', Board, Pawns);
  socket.emit('move', { x: targetPos.x, y: targetPos.y, oldX: movingPawnOldPos.x, oldY: movingPawnOldPos.y }); // Send the move to the server
}

function mousePressed() {
  if (mouseButton === RIGHT) {
    let X = mouseX;
    let Y = mouseY;
    for (let i = 0; i < Board.length; i++)
      if (X > Board[i].rectCenter - 34 && X < Board[i].rectCenter + 34 &&
          Y > Board[i].rectCenterY - 34 && Y < Board[i].rectCenterY + 34)
        console.log(Board[i]);
    for (let i = 0; i < Pawns.length; i++) {
      let p = Pawns[i];
      if (X > p.rectCenter - 34 && X < p.rectCenter + 34 && Y > p.rectCenterY - 34 && Y < p.rectCenterY + 34) {
        console.log(Pawns[i]);
      }
    }
  }
}
