function kill() {
    if (isPawnMoving) return; // Prevent further actions while a pawn is moving
    let killConditions = []; // Array to store kill conditions
    for (let j = 0; j < Pawns.length; j++) {
      for (let k = 0; k < Pawns.length; k++) {
        if (Pawns[j].isRed != Pawns[k].isRed && Pawns[j].live && Pawns[k].live && 
            ((Greenturn == false && Pawns[j].isRed == false) || (Greenturn == true && Pawns[j].isRed == true))) {
          if ((Pawns[k].row - Pawns[j].row == 1 && Pawns[k].column - Pawns[j].column == 1) ||
              (Pawns[k].row - Pawns[j].row == 1 && Pawns[k].column - Pawns[j].column == -1) ||
              (Pawns[k].row - Pawns[j].row == -1 && Pawns[k].column - Pawns[j].column == 1) ||
              (Pawns[k].row - Pawns[j].row == -1 && Pawns[k].column - Pawns[j].column == -1)) {
            for (let i = 0; i < Board.length; i++) {
              if (Pawns[j].row - Board[i].row == 1 && Pawns[j].column - Board[i].column == 1 && Board[i].free) {
                killConditions.push({winner: k, looser: j, newBoard: i});
              }
              if (Pawns[j].row - Board[i].row == 1 && Pawns[j].column - Board[i].column == -1 && Board[i].free) {
                killConditions.push({winner: k, looser: j, newBoard: i});
              }
              if (Pawns[j].row - Board[i].row == -1 && Pawns[j].column - Board[i].column == 1 && Board[i].free) {
                killConditions.push({winner: k, looser: j, newBoard: i});
              }
              if (Pawns[j].row - Board[i].row == -1 && Pawns[j].column - Board[i].column == -1 && Board[i].free) {
                killConditions.push({winner: k, looser: j, newBoard: i});
              }
            }
          }
        }
      }
    }
    // Execute kill switch for each condition
    killConditions.forEach(condition => {
      killSwitch(condition.winner, condition.looser, condition.newBoard);
    });
  }