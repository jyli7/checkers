var Board = function (rows, cols, wrapperId) {
	this.rows = rows;
	this.cols = cols;
	this.wrapperId = wrapperId;
	this.boardId = 'game-board';
	this.board = [];
};

Board.prototype.draw = function () {
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

Board.prototype.setPieces = function (topPlayer, bottomPlayer) {
	var countForPlacement = 0;
	for (var i = 0; i < this.rows; i++) {
		this.board.push([]);
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
	debugger;
}

var Piece = function (owner, yPos, xPos) {
	this.owner = owner;
	this.xPos = xPos;
	this.yPos = yPos;
}

var Player = function () {

}

window.onload = function () {
	var board = new Board(10, 10, 'board-wrapper')
	var topPlayer = new Player();
	var bottomPlayer = new Player();
	board.draw();
	board.setPieces();
}
