$(document).ready(function () {
	startGame();

	$('.reset-link').on('click', function (e) {
		e.preventDefault();
		startGame();
	});
});

var startGame = function () {
	$('.reset-link').hide();

	var topPlayer = new Player('X');
	var bottomPlayer = new Player('O');
	var board = new Board(4, 4, 'board-wrapper', topPlayer, bottomPlayer)

	board.drawBlank();
	board.setPiecesWithoutDrawing();
	board.setClickHandlersOnSquares();

	var then = Date.now();

	// Game loop
	board.loop = setInterval(function () {
		board.drawBoardWithPieces();
		board.showCurrentPlayerName();

		// Check if game is over
		var loser = board.returnLoser();
		if (loser !== undefined) {
			endGame(board, loser);
		}
		var now = Date.now();
		board.loopTimeElapsed = (now - then) / 1000;
		then = now;
	}, 10); // Execute as fast as possible
}

var endGame = function (board, loser) {
	board.state = "gameOver";
	if (loser === board.topPlayer) {
		alert(board.bottomPlayer.name + " player wins!");
	} else {
		alert(board.topPlayer.name + " player wins!");
	}
	clearInterval(board.loop);
	$('.reset-link').show();
}
