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

Board.prototype.setVirtualPieces = function (topPlayer, bottomPlayer) {
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

Board.prototype.drawBoardWithPieces = function (topPlayer, bottomPlayer) {
	for (var i = 0; i < this.rows; i++) {
		for (var j = 0; j < this.rows; j++) {
			if (this.board[i][j].owner === topPlayer) {
				document.getElementById(i + '-' + j).innerHTML = "<div class='top-player-piece'>O</div>";
			} else if (this.board[i][j].owner === bottomPlayer) {
				document.getElementById(i + '-' + j).innerHTML = "<div class='bottom-player-piece'>O</div>";
			}
		}
	}
}

Board.prototype.play = function (topPlayer, bottomPlayer) {
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
				});
			}
		}
	}
}

Board.prototype.movePiece = function (piece) {
	var validDestinationSquares = this.determineValidDestinationSquares(piece);

	for (var i = 0; i < validDestinationSquares.length; i++) {
		var x = validDestinationSquares[i].iPos;
		var y = validDestinationSquares[i].jPos;
		var validDestinationCell = document.getElementById(x + '-' + y);
		validDestinationCell.addEventListener("click", function(e) {
			console.log("valid!");
		})
	}
}

Board.prototype.cellOnBoard = function (x, y) {
	return (x < this.board.length && x >= 0) && (y < this.board[x].length && y >= 0)
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
	console.log(validSquares);
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
	board.setVirtualPieces(topPlayer, bottomPlayer);
	board.drawBoardWithPieces(topPlayer, bottomPlayer);
	// put this in a "game" object?
	board.play(topPlayer, bottomPlayer);
}
