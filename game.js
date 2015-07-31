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
	var gameManager = new GameManager(4, 4, 'board-wrapper', topPlayer, bottomPlayer)

	gameManager.drawBlankCellsOnScreen();
	gameManager.populateVirtualBoardWithPieces();
	gameManager.setClickHandlersOnSquares();

	var then = Date.now();

	// Game loop
	gameManager.loop = setInterval(function () {
		gameManager.drawPieces();
		gameManager.showCurrentPlayerName();

		// Check if game is over
		var loser = gameManager.returnLoser();
		if (loser !== undefined) {
			endGame(gameManager, loser);
		}

		var now = Date.now();
		gameManager.loopTimeElapsed = (now - then) / 1000;
		then = now;
	}, 10); // Execute as fast as possible
}

var endGame = function (gameManager, loser) {
	if (loser === gameManager.topPlayer) {
		alert(gameManager.bottomPlayer.name + " player wins!");
	} else {
		alert(gameManager.topPlayer.name + " player wins!");
	}
	clearInterval(gameManager.loop);
	$('.reset-link').show();
}
