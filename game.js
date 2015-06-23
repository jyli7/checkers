var Board = function (rows, cols, wrapperId, topPlayer, bottomPlayer) {
	this.rows = rows;
	this.cols = cols;
	this.wrapperId = wrapperId;
	this.boardId = 'game-board';
	this.board = [];
	this.topPlayer = topPlayer;
	this.bottomPlayer = bottomPlayer;
};

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
			if (i < 3 && countForPlacement % 2 == 0) {
				this.board[this.board.length - 1].push(new Piece(topPlayer, i, j));
			} else if (i >= this.rows - 3 && countForPlacement % 2 == 0) {
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
		for (var j = 0; j < this.rows; j++) {
			if (this.board[i][j].owner === topPlayer) {
				document.getElementById(i + '-' + j).innerHTML = "<div class='top-player-piece'>O</div>";
			} else if (this.board[i][j].owner === bottomPlayer) {
				document.getElementById(i + '-' + j).innerHTML = "<div class='bottom-player-piece'>O</div>";
			} else {
				document.getElementById(i + '-' + j).innerHTML = "<div></div>";
			}
		}
	}
}

Board.prototype.play = function () {
	var topPlayer = this.topPlayer;
	var bottomPlayer = this.bottomPlayer;
	var gameOver = false;
	var turnCount = 0;
	var currentPlayer;
	if (turnCount % 2 == 0) {
		currentPlayer = topPlayer;
	} else {
		currentPlayer = bottomPlayer;
	}
	var piece = this.selectPiece(currentPlayer);
	turnCount += 1;
}

Board.prototype.selectPiece = function (player) {
	var that = this;
	for (var i = 0; i < this.rows; i++) {
		for (var j = 0; j < this.rows; j++) {
			if (this.board[i][j].owner === player) {
				var pieceCell = document.getElementById(i + '-' + j);
				pieceCell.addEventListener("click", function(e) {
					var selectedCellId = e.target.offsetParent.id;
					var selectedCellCoords = selectedCellId.split("-");
					var i = parseInt(selectedCellCoords[0]);
					var j = parseInt(selectedCellCoords[1]);
					var selectedPiece = that.board[i][j];
					that.movePiece(selectedPiece);
					console.log("piece selected...now move piece to valid spot!")
				});
			}
		}
	}
}

Board.prototype.movePiece = function (piece) {
	var validDestinationSquares = this.determineValidDestinationSquares(piece);
	var that = this;
	var origI = piece.iPos;
	var origJ = piece.jPos;
	var origOwner = piece.owner;

	for (var i = 0; i < validDestinationSquares.length; i++) {
		var possibleI = validDestinationSquares[i].iPos;
		var possibleJ = validDestinationSquares[i].jPos;
		var validDestinationCell = document.getElementById(possibleI + '-' + possibleJ);
		validDestinationCell.addEventListener("click", function(e) {
			var destId = e.target.id.split("-");
			// TODO: CONSOLIDATE REASSIGNMENT INTO ONE PLACE!
			var destI = parseInt(destId[0]);
			var destJ = parseInt(destId[1]);
			piece.iPos = destI;
			piece.jPos = destJ;
			that.board[origI][origJ].owner = undefined;
			that.board[destI][destJ].owner = origOwner;
			that.drawBoardWithPieces();
		});
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
		validSquares.push([piece.iPos + 2, piece.jPos + 2]);
	}

	if (this.cellOnBoard(piece.iPos + 1 * moveDirectionI, piece.jPos - 1) &&
			this.cellOnBoard(piece.iPos + 2 * moveDirectionI, piece.jPos - 2) &&
			board[piece.iPos + 1 * moveDirectionI][piece.jPos - 1].owner === opposingPlayer &&
		  board[piece.iPos + 2 * moveDirectionI][piece.jPos - 2].owner === undefined) {
		validSquares.push([piece.iPos + 2 * moveDirectionI, piece.jPos - 2]);
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

var Piece = function (owner, iPos, jPos) {
	this.owner = owner;
	this.iPos = iPos;
	this.jPos = jPos;
}

var Player = function () {};

window.onload = function () {
	var topPlayer = new Player();
	var bottomPlayer = new Player();
	var board = new Board(8, 8, 'board-wrapper', topPlayer, bottomPlayer)
	board.drawBlank();
	board.setVirtualPieces();
	board.drawBoardWithPieces();
	// put this in a "game" object?
	board.play();
}
