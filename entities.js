var Piece = function (owner, iPos, jPos) {
	this.owner = owner;
	this.iPos = iPos;
	this.jPos = jPos;
	this.king = false;
}

var Player = function (name) {
	this.name = name;
};

var GameManager = function (numRows, numCols, wrapperId, topPlayer, bottomPlayer) {
	this.numRows = numRows;
	this.numCols = numCols;
	this.wrapperId = wrapperId;
	this.board = [];
	this.topPlayer = topPlayer;
	this.bottomPlayer = bottomPlayer;
	this.currentPlayer = topPlayer;
	this.selectedPiece;
	this.validDestinationSquares;
	this.cellsToClear = [];
	this.validDestinationCoordsForSelected;
	this.state = "selectPiece";
};

GameManager.prototype.drawBlankCellsOnScreen = function () {
	var tableHTML = "<table id=" + 'game-board' + ">"
	var countForColor = 0
	for (var i = 0; i < this.numRows; i++) {
		tableHTML += "<tr>"
		countForColor += 1
		for (var j = 0; j < this.numCols; j++) {
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

GameManager.prototype.populateWithPieces = function () {
	var topPlayer = this.topPlayer;
	var bottomPlayer = this.bottomPlayer;
	var countForPlacement = 0;
	for (var i = 0; i < this.numRows; i++) {
		this.board.push([]);
		countForPlacement += 1;
		for (var j = 0; j < this.numRows; j++) {
			if (i < (this.numRows / 2 - 1) && countForPlacement % 2 == 0) {
				this.board[this.board.length - 1].push(new Piece(topPlayer, i, j));
			} else if (i >= (this.numRows - (this.numRows / 2 - 1)) && countForPlacement % 2 == 0) {
				this.board[this.board.length - 1].push(new Piece(bottomPlayer, i, j));
			} else {
				this.board[this.board.length - 1].push(new Piece(undefined, i, j));
			}
			countForPlacement += 1;
		}
	}
}

GameManager.prototype.setClickHandlersOnSquares = function () {
	var that = this;
	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numRows; j++) {
			var pieceCell = document.getElementById(i + '-' + j);
			pieceCell.addEventListener("click", function (e) {
				that.generalPieceCellClickedFunction(e, that);
			});
		}
	}
}

GameManager.prototype.drawPieces = function () {
	var topPlayer = this.topPlayer;
	var bottomPlayer = this.bottomPlayer;
	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numCols; j++) {
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

GameManager.prototype.returnLoser = function () {
	var topPlayer = this.topPlayer;
	var bottomPlayer = this.bottomPlayer;
	var topPlayerAlive = false;
	var bottomPlayerAlive = false;

	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numCols; j++) {
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


GameManager.prototype.generalPieceCellClickedFunction = function (e, higherLevelBoard) {
	var board = higherLevelBoard.board;
	var clickedCellId = e.target.id;
	var clickedCellCoords = clickedCellId.split("-");
	var i = parseInt(clickedCellCoords[0]);
	var j = parseInt(clickedCellCoords[1]);


	if (higherLevelBoard.state === "selectPiece") {
		higherLevelBoard.selectedPiece = board[i][j];
		if (higherLevelBoard.currentPlayer === higherLevelBoard.selectedPiece.owner) {
			higherLevelBoard.validDestinationSquares = this.allValidDestinationSquaresFor(this.selectedPiece);
			higherLevelBoard.state = "movePiece";
			var selectedCell = $('#' + i + "-" + j);
			selectedCell.addClass('selected');
			board.validDestinationCoordsForSelected = higherLevelBoard.validDestinationSquares.map(function (obj) {
				return [obj.iPos, obj.jPos];
			});
			board.validDestinationCoordsForSelected.forEach(function (coords) {
				var possibleDestinationCell = $('#' + coords[0] + "-" + coords[1]);
				possibleDestinationCell.addClass("possibleDestination");
			});
		}
	} else if (higherLevelBoard.state === "movePiece") {
		if (looseContains(board.validDestinationCoordsForSelected, [i, j])) {
			var origOwner = higherLevelBoard.selectedPiece.owner;
			var origKing = higherLevelBoard.selectedPiece.king;
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

			board[origI][origJ].king = false;
			board[i][j].king = origKing;

			// If we're at the back of the board, king the piece
			if (higherLevelBoard.selectedPiece.owner === higherLevelBoard.topPlayer) {
				if (i === higherLevelBoard.numRows - 1) {
					console.log("kinged!");
					board[i][j].king = true;
				}
			} else if (higherLevelBoard.selectedPiece.owner === higherLevelBoard.bottomPlayer) {
				if (i === 0) {
					console.log("kinged!");
					board[i][j].king = true;
				}
			}

			board[origI][origJ].owner = undefined;
			board[i][j].owner = origOwner;
			higherLevelBoard.switchPlayer();
			higherLevelBoard.state = "selectPiece";
			$('.selected').removeClass('selected');
			$('.possibleDestination').removeClass('possibleDestination');
		} else if (higherLevelBoard.selectedPiece.iPos === i && higherLevelBoard.selectedPiece.jPos === j) {
			$('.selected').removeClass('selected');
			$('.possibleDestination').removeClass('possibleDestination');
			higherLevelBoard.selectedPiece = undefined;
			higherLevelBoard.state = "selectPiece";
		}
	}

}

GameManager.prototype.switchPlayer = function () {
	if (this.currentPlayer === this.topPlayer) {
		this.currentPlayer = this.bottomPlayer;
	} else {
		this.currentPlayer = this.topPlayer;
	}
}

GameManager.prototype.cellOnBoard = function (i, j) {
	return (i < this.board.length && i >= 0) && (j < this.board[i].length && j >= 0)
}

GameManager.prototype.canJump = function (piece, moveDirectionI, moveDirectionJ) {
	var board = this.board;
	var opposingPlayer;
	if (piece.owner === this.topPlayer) {
		opposingPlayer = this.bottomPlayer;	
	} else {
		opposingPlayer = this.topPlayer;
	}

	return this.cellOnBoard(piece.iPos + 1 * moveDirectionI, piece.jPos + 1 * moveDirectionJ) &&
		this.cellOnBoard(piece.iPos + 2 * moveDirectionI, piece.jPos + 2 * moveDirectionJ) &&
	  board[piece.iPos + 1 * moveDirectionI][piece.jPos + 1 * moveDirectionJ].owner === opposingPlayer &&
	  board[piece.iPos + 2 * moveDirectionI][piece.jPos + 2 * moveDirectionJ].owner === undefined
}

GameManager.prototype.canSimpleMove = function (piece, moveDirectionI, moveDirectionJ) {
	var board = this.board;

	return this.cellOnBoard(piece.iPos + 1 * moveDirectionI, piece.jPos + 1 * moveDirectionJ) &&
		board[piece.iPos + 1 * moveDirectionI][piece.jPos + 1 * moveDirectionJ].owner === undefined
}

GameManager.prototype.jumpsAndMovesFor = function(piece, moveDirectionI) {
	var validSquares = [];
	var board = this.board;

	// Jump right
	if (this.canJump(piece, moveDirectionI, 1)) {
		validSquares.push(board[piece.iPos + 2 * moveDirectionI][piece.jPos + 2]);
	}

	// Jump left
	if (this.canJump(piece, moveDirectionI, -1)) {
		validSquares.push(board[piece.iPos + 2 * moveDirectionI][piece.jPos - 2]);
	}

	// Move right
	if (this.canSimpleMove(piece, moveDirectionI, 1)) {
		validSquares.push(board[piece.iPos + 1 * moveDirectionI][piece.jPos + 1]);
	}

	// Move left
	if (this.canSimpleMove(piece, moveDirectionI, -1)) {
		validSquares.push(board[piece.iPos + 1 * moveDirectionI][piece.jPos - 1]);
	}

	return validSquares
}

// TODO: DRY THIS UP
GameManager.prototype.allValidDestinationSquaresFor = function (piece) {
	// Basic top player pieces can only move downward,
	// Basic bottom player can only move upward
	var validSquares = [];
	var moveDirection;
	var board = this.board;

	if (piece.owner === this.topPlayer) {
		moveDirectionI = 1;
	} else {
		moveDirectionI = -1;
	}

	validSquares = validSquares.concat(this.jumpsAndMovesFor(piece, moveDirectionI))
	if (piece.king === true) {
		moveDirectionI *= -1;
		validSquares = validSquares.concat(this.jumpsAndMovesFor(piece, moveDirectionI))
	}

	return validSquares;
}

GameManager.prototype.showCurrentPlayerName = function () {
	document.getElementById('current-player-wrapper').innerHTML = this.currentPlayer.name + "'s move";
}