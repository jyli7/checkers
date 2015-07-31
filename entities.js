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

// Functions related to visuals
///////////////////////////////

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

GameManager.prototype.drawPieces = function () {
	var topPlayer = this.topPlayer;
	var bottomPlayer = this.bottomPlayer;
	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numCols; j++) {
			if (this.board[i][j].owner === topPlayer) {
				if (this.board[i][j].king) {
					document.getElementById(i + '-' + j).innerHTML = "X!";
				} else {
					document.getElementById(i + '-' + j).innerHTML = "X";
				}
			} else if (this.board[i][j].owner === bottomPlayer) {
				if (this.board[i][j].king) {
					document.getElementById(i + '-' + j).innerHTML = "O!";
				} else {
					document.getElementById(i + '-' + j).innerHTML = "O";
				}
			} else {
				document.getElementById(i + '-' + j).innerHTML = "";
			}
		}
	}
}

GameManager.prototype.showCurrentPlayerName = function () {
	document.getElementById('current-player-wrapper').innerHTML = this.currentPlayer.name + "'s move";
}

GameManager.prototype.updateVisuals = function () {
	$('.selected').removeClass('selected');
}

GameManager.prototype.initiateSelectedCellVisual = function (i, j) {
	var selectedCell = $('#' + i + "-" + j);
	selectedCell.addClass('selected');
}

// Functions that set up pieces and board
/////////////////////////////////////////

GameManager.prototype.populateVirtualBoardWithPieces = function () {
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
				that.cellClicked(e);
			});
		}
	}
}

GameManager.prototype.cellClicked = function (e) {
	var board = this.board;
	var clickedCellId = e.target.id;
	var clickedCellCoords = clickedCellId.split("-");
	var i = parseInt(clickedCellCoords[0]);
	var j = parseInt(clickedCellCoords[1]);

	if (this.state === "selectPiece") {
		this.selectedPiece = board[i][j];

		if (this.currentPlayer === this.selectedPiece.owner) {
			this.initiateSelectedCellVisual(i, j)
			this.setValidDestinationCoords(this.selectedPiece, i, j)
			this.state = "movePiece";
		}
	} else if (this.state === "movePiece") {
		if (this.moveIsValid(i, j)) {
			this.movePiece(i, j);
		} else if (this.reclickedAlreadySelectedPiece(i, j)) {
			$('.selected').removeClass('selected');
			this.selectedPiece = undefined;
			this.state = "selectPiece";
		}
	}
}

GameManager.prototype.setValidDestinationCoords = function (selectedPiece, i, j) {
	this.validDestinationSquares = this.allValidDestinationSquaresFor(selectedPiece);
	this.validDestinationCoordsForSelected = this.validDestinationSquares.map(function (obj) {
		return [obj.iPos, obj.jPos];
	});
}

// Movement related functions
/////////////////////////////

GameManager.prototype.reclickedAlreadySelectedPiece = function (i, j) {
	return this.selectedPiece.iPos === i && this.selectedPiece.jPos === j
}

GameManager.prototype.moveIsValid = function (i, j) {
	return containsArray(this.validDestinationCoordsForSelected, [i, j]);
}

GameManager.prototype.movePiece = function (i, j) {
	var origOwner = this.selectedPiece.owner;
	var origKing = this.selectedPiece.king;
	var origI = this.selectedPiece.iPos;
	var origJ = this.selectedPiece.jPos;

	this.clearDeadPieces(i, j, origI, origJ);
	this.updateKingship(i, j, origI, origJ);
	this.updateCellOwnership(i, j, origI, origJ);
	this.updateVisuals();
	this.switchPlayer();
	this.state = "selectPiece";
}

GameManager.prototype.clearDeadPieces = function (i, j, origI, origJ) {
	var board = this.board;

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
}

GameManager.prototype.updateKingship = function (i, j, origI, origJ) {
	var board = this.board;
	var origOwner = this.selectedPiece.owner;
	var origKing = this.selectedPiece.king;

	board[origI][origJ].king = false;
	board[i][j].king = origKing;

	// If we're at the back of the board, king the piece
	if (this.selectedPiece.owner === this.topPlayer) {
		if (i === this.numRows - 1) {
			board[i][j].king = true;
		}
	} else if (this.selectedPiece.owner === this.bottomPlayer) {
		if (i === 0) {
			board[i][j].king = true;
		}
	}
}

GameManager.prototype.updateCellOwnership = function (i, j, origI, origJ) {
	var origOwner = this.selectedPiece.owner;
	var origKing = this.selectedPiece.king;

	var board = this.board;
	board[origI][origJ].owner = undefined;
	board[i][j].owner = origOwner;
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


GameManager.prototype.allValidDestinationSquaresFor = function (piece) {
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

// Game completion logic
////////////////////////

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