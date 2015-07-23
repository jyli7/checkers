var Board = function (rows, cols, wrapperId, topPlayer, bottomPlayer) {
	this.rows = rows;
	this.cols = cols;
	this.wrapperId = wrapperId;
	this.boardId = 'game-board';
	this.board = [];
	this.topPlayer = topPlayer;
	this.bottomPlayer = bottomPlayer;
	this.currentPlayer = topPlayer;
	this.selectedPiece;
	this.validDestinationSquares;
	this.cellsToClear = [];
};

Board.prototype.state = "selectPiece";

Board.prototype.drawBlank = function () {
	var tableHTML = "<table id=" + 'game-board' + ">"
	var countForColor = 0
	for (var i = 0; i < this.rows; i++) {
		tableHTML += "<tr>"
		countForColor += 1
		for (var j = 0; j < this.cols; j++) {
			if (countForColor % 2 == 0) {
				tableHTML += "<td class='dark-square' id='" + i + "-" + j + "'></td>"
			} else {
				tableHTML += "<td class='light-square' id='" + i + "-" + j + "'></td>"
			}
			countForColor += 1
		}
		tableHTML += "</tr>"
	}
	tableHTML += "</table>"
	document.getElementById(this.wrapperId).innerHTML = tableHTML;	
}

Board.prototype.setVirtualPieces = function () {
	var topPlayer = this.topPlayer;
	var bottomPlayer = this.bottomPlayer;
	var countForPlacement = 0;
	for (var i = 0; i < this.rows; i++) {
		this.board.push([]);
		countForPlacement += 1;
		for (var j = 0; j < this.rows; j++) {
			if (i < (this.rows / 2 - 1) && countForPlacement % 2 == 0) {
				this.board[this.board.length - 1].push(new Piece(topPlayer, i, j));
			} else if (i >= (this.rows - (this.rows / 2 - 1)) && countForPlacement % 2 == 0) {
				this.board[this.board.length - 1].push(new Piece(bottomPlayer, i, j));
			} else {
				this.board[this.board.length - 1].push(new Piece(undefined, i, j));
			}
			countForPlacement += 1;
		}
	}
}

Board.prototype.drawBoardWithPieces = function () {
	var topPlayer = this.topPlayer;
	var bottomPlayer = this.bottomPlayer;
	for (var i = 0; i < this.rows; i++) {
		for (var j = 0; j < this.cols; j++) {
			if (this.board[i][j].owner === topPlayer) {
				document.getElementById(i + '-' + j).innerHTML = "X";
			} else if (this.board[i][j].owner === bottomPlayer) {
				document.getElementById(i + '-' + j).innerHTML = "O";
			} else {
				document.getElementById(i + '-' + j).innerHTML = "";
			}
		}
	}
}

Board.prototype.returnLoser = function () {
	var topPlayer = this.topPlayer;
	var bottomPlayer = this.bottomPlayer;
	var topPlayerAlive = false;
	var bottomPlayerAlive = false;

	for (var i = 0; i < this.rows; i++) {
		for (var j = 0; j < this.cols; j++) {
			if (this.board[i][j].owner === topPlayer) {
				topPlayerAlive = true;
			} else if (this.board[i][j].owner === bottomPlayer) {
				bottomPlayerAlive = true;
			}
		}
	}

	if (!topPlayerAlive) {
		return topPlayer;
	} else if (!bottomPlayerAlive) {
		return bottomPlayer
	} else {
		return undefined;
	}
}



Board.prototype.setClickHandlers = function () {
	var that = this;
	for (var i = 0; i < this.rows; i++) {
		for (var j = 0; j < this.rows; j++) {
			var pieceCell = document.getElementById(i + '-' + j);
			pieceCell.addEventListener("click", function (e) {
				that.generalPieceCellClickedFunction(e, that);
			});
		}
	}
}

Board.prototype.generalPieceCellClickedFunction = function (e, higherLevelBoard) {
	var board = higherLevelBoard.board;
	var clickedCellId = e.target.id;
	var clickedCellCoords = clickedCellId.split("-");
	var i = parseInt(clickedCellCoords[0]);
	var j = parseInt(clickedCellCoords[1]);
	console.log("piece clicked");
	if (higherLevelBoard.state === "selectPiece") {
		higherLevelBoard.selectedPiece = board[i][j];
		if (higherLevelBoard.currentPlayer === higherLevelBoard.selectedPiece.owner) {
			higherLevelBoard.validDestinationSquares = this.determineValidDestinationSquares(this.selectedPiece);
			higherLevelBoard.state = "movePiece";
			console.log("piece selected...now move piece to valid spot!")
		} else {
			console.log("not your piece!")
		}
	} else if (higherLevelBoard.state === "movePiece") {
		console.log("move piece click")
		var validDestinationSquaresCoords = higherLevelBoard.validDestinationSquares.map(function (obj) {
			return [obj.iPos, obj.jPos];
		});
		console.log(validDestinationSquaresCoords);
		if (looseContains(validDestinationSquaresCoords, [i, j])) {
			var origOwner = higherLevelBoard.selectedPiece.owner;
			var origI = higherLevelBoard.selectedPiece.iPos;
			var origJ = higherLevelBoard.selectedPiece.jPos;
			// If we're jumping, clear the opponent's piece
			if (Math.abs(i - origI) > 1) {
				if (i < origI) {
					if (j < origJ) {
						board[i + 1][j + 1].owner = undefined;
					} else if (j > origJ) {
						board[i + 1][j - 1].owner = undefined;
					}
				} else {
					if (j < origJ) {
						board[i - 1][j + 1].owner = undefined;
					} else if (j > origJ) {
						board[i - 1][j - 1].owner = undefined;
					}
				}
			}
			board[origI][origJ].owner = undefined;
			board[i][j].owner = origOwner;
			higherLevelBoard.switchPlayer();
			higherLevelBoard.state = "selectPiece";
		}
	}
}

Board.prototype.switchPlayer = function () {
	if (this.currentPlayer === this.topPlayer) {
		this.currentPlayer = this.bottomPlayer;
	} else {
		this.currentPlayer = this.topPlayer;
	}
}

Board.prototype.cellOnBoard = function (i, j) {
	return (i < this.board.length && i >= 0) && (j < this.board[i].length && j >= 0)
}

// TODO: DRY THIS UP
Board.prototype.determineValidDestinationSquares = function (piece) {
	// Basic top player pieces can only move downward,
	// Basic bottom player can only move upward
	var validSquares = [];
	var opposingPlayer;
	var moveDirection;
	var board = this.board;
	if (piece.owner === this.topPlayer) {
		opposingPlayer = this.bottomPlayer;	
		moveDirectionI = 1;
	} else {
		opposingPlayer = this.topPlayer;
		moveDirectionI = -1;
	}

	// Check if jump is possible
	if (this.cellOnBoard(piece.iPos + 1 * moveDirectionI, piece.jPos + 1) &&
			this.cellOnBoard(piece.iPos + 2 * moveDirectionI, piece.jPos + 2) &&
		  board[piece.iPos + 1 * moveDirectionI][piece.jPos + 1].owner === opposingPlayer &&
		  board[piece.iPos + 2 * moveDirectionI][piece.jPos + 2].owner === undefined) {
		validSquares.push(board[piece.iPos + 2 * moveDirectionI][piece.jPos + 2]);
	}

	if (this.cellOnBoard(piece.iPos + 1 * moveDirectionI, piece.jPos - 1) &&
			this.cellOnBoard(piece.iPos + 2 * moveDirectionI, piece.jPos - 2) &&
			board[piece.iPos + 1 * moveDirectionI][piece.jPos - 1].owner === opposingPlayer &&
		  board[piece.iPos + 2 * moveDirectionI][piece.jPos - 2].owner === undefined) {
		validSquares.push(board[piece.iPos + 2 * moveDirectionI][piece.jPos - 2]);
	}

	// If jump is possible, MUST jump
	if (validSquares.length > 0) {
		return validSquares;
	} else {
		if (this.cellOnBoard(piece.iPos + 1 * moveDirectionI, piece.jPos + 1) &&
				board[piece.iPos + 1 * moveDirectionI][piece.jPos + 1].owner === undefined) {
			validSquares.push(board[piece.iPos + 1 * moveDirectionI][piece.jPos + 1]);
		}

		if (this.cellOnBoard(piece.iPos + 1  * moveDirectionI, piece.jPos - 1) &&
				board[piece.iPos + 1  * moveDirectionI][piece.jPos - 1].owner === undefined) {
			validSquares.push(board[piece.iPos + 1  * moveDirectionI][piece.jPos - 1]);
		}
	}
	return validSquares;
}

Board.prototype.drawCurrentPlayer = function () {
	document.getElementById('current-player-wrapper').innerHTML = this.currentPlayer.name;
}

var Piece = function (owner, iPos, jPos) {
	this.owner = owner;
	this.iPos = iPos;
	this.jPos = jPos;
}

var Player = function (name) {
	this.name = name;
};

function looseContains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i].toString() == obj.toString()) {
           return true;
       }
    }
    return false;
}

window.onload = function () {
	var topPlayer = new Player('top');
	var bottomPlayer = new Player('bottom');
	var board = new Board(4, 4, 'board-wrapper', topPlayer, bottomPlayer)
	board.drawBlank();
	board.setVirtualPieces();
	board.setClickHandlers();
	var then = Date.now();

	board.loop = setInterval(function () {
		board.drawBoardWithPieces();
		board.drawCurrentPlayer();
		var loser = board.returnLoser();
		if (loser !== undefined) {
			console.log("GAME OVER")
			board.state = "gameOver";
		}
		var now = Date.now();
		board.loopTimeElapsed = (now - then) / 1000;
		then = now;
	}, 10); // Execute as fast as possible
}
