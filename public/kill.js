function killSwitch(winner, looser, newBoard) {
    let prevRow = Pawns[k].row;
              let prevColumn = Pawns[k].column;
              
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
              Pawns.splice(looser,1);
              Board[winner].free = false;
              ////console.log("turn" + Greenturn);
              ////console.log(Pawns[k].isRed);
              pawnSelected = false;
              
              //console.log(Board + m);
              socket.emit('kill state', Board, Pawns);
              socket.emit('move', { x: targetPos.x, y: targetPos.y, oldX: movingPawnOldPos.x, oldY: movingPawnOldPos.y }, Board); // Send the move to the server
  }