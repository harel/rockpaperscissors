/**
 *
 * The game provides a set of default criteria for paperrockstone but it is
 * possible to extend the game into different variants by providing your own
 * assets and rule sets.
 * The assets are an object where the values are images representing the
 * game piece (rock, paper, scissors, lizard etc.) and the rules. The keys
 * should describe each piece.
 * Rules is a map describing which piece wins which other piece.
 *
 * RPS doesn't assume a rendering environment and instead requires the
 * ids of certain containers to render elements to. Those ids are supplied as
 * the renderingSpec argument to the constructor, and have the following signature:
 * {
 * 	player1: 'player1container',
 * 	player1ctrl: 'player1Ctrl',
 * 	player2: 'player2container',
 * 	player2ctrl: 'player2Ctrl',
 * 	messages: 'statusContainer',
 * 	rounds: 'roundsIndicator'
 * }
 *
 * This game was brought to you jQuery free, and in beautiful Vanilla flavour.
 */
const DEFAULT_NUM_OF_ROUNDS = 3;
const PLAYER_1 = 0;
const PLAYER_2 = 1;
const DRAW = -1;
const HUMAN = 'H';
const CPU = 'C';
const LOST_IT_IMG = 'http://www.threadbombing.com/data/media/2/xgllya.gif';
const WINNER_IMG = 'https://media.giphy.com/media/rypyVNU547qrC/giphy.gif';
const DEFAULT_PLAYERS = [HUMAN, CPU];
const OUTCOME_LABELS = {
	'-1': 'Nobody!',
	'0': 'Player 1',
	'1': 'Player 2'
};
const DEFAULT_ASSETS = {
	'rock': 'http://www.dododex.com/media/item/Stone.png', // ROCK
	'paper': 'http://eliteownage.com/paper.jpg', // PAPER
	'scissors': 'http://findicons.com/files/icons/196/office_tools/128/scissors.png' // SCISSORS
};
const DEFAULT_RULES = {
	'rock': {wins: ['scissors']},
	'paper': {wins: ['rock']},
	'scissors': {wins: ['paper']}
};
const DEFAULT_RENDER_SPEC = {
	player1: 'player1',
	player1ctrl: 'player1Ctrl',
	player2: 'player2',
	player2ctrl: 'player2Ctrl',
	messages: 'messages',
	rounds: 'roundIndicator'
};
/**
 * Returns an element by id
 * @param  {string} id element selector
 * @return {DomNode}
 */
const byId = function(id) {
	return document.getElementById(id);
}

/**
 * Helper Create DOM element
 * @param  {string} elementType       The name of the element to create (div, img etc.)
 * @param  {string} elementClass      Any class name to attach
 * @param  {string} [content=null]    Any content to set as innerHTML
 * @param  {object} [attributes=null] Any additional attributes
 * @return {DOMNode}
 */
const createEl = function(elementType, elementClass=null, content=null, attributes=null) {
	const element = document.createElement(elementType);
	if (elementClass) {
		element.className = elementClass;
	}
	if (attributes && typeof(attributes)=='object') {
		Object.keys(attributes).map((key) => {
			element.setAttribute(key, attributes[key])
		})
	}
	if (content) {
		element.innerHTML = content;
	}
	return element;
}

/**
 * Quickly clear the children of this elements before the parent comes
 * home and sees all the mess they made
 * @param  {parent} element
 */
const clearChildren = function(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

export default class RockPaperScissors {
	constructor(players=null, renderingSpec=null, assets=null, rules=null, rounds=null) {
		console.log(players, renderingSpec, assets, rules, rounds)
		this.renderingSpec = renderingSpec || DEFAULT_RENDER_SPEC;
		// setup the assets and rules if provided or use the default
		this.assets = assets || DEFAULT_ASSETS;
		this.rules = rules || DEFAULT_RULES;
		// a log of match outcomes
		this.matchLog = [];
		// this match's players
		this.players = players || DEFAULT_PLAYERS;
		// current player
		this.currentPlayer = PLAYER_1;
		// all the game 'pieces'
		this.pieces = Object.keys(this.assets);
		// current played hand
		this.hand = Array(2);
		// state of players played. When this array's sum is 1, eval should happen
		this.state = [0, 0];
		this.maxRounds = rounds || DEFAULT_NUM_OF_ROUNDS;
		this.rounds = 1;
		// pause state for fully automated matches
		this.paused = false;
		this.turn = PLAYER_1;
		this.initialiseGame();
	}

	/**
	 * Prepare a new game
	 */
	initialiseGame() {
		this.initialiseLayout();
		this.welcomeMessages();
		this.run();
	}

	/**
	 * Initialise the layout elements required to render to based on the
	 * provided rendering spec. Clear out the kids so we can start fresh.
	 */
	initialiseLayout() {
		this.player1Container = byId(this.renderingSpec.player1);
		clearChildren(this.player1Container);
		this.player1Ctrl = byId(this.renderingSpec.player1ctrl);
		clearChildren(this.player1Ctrl);
		this.player2Container = byId(this.renderingSpec.player2);
		clearChildren(this.player2Container);
		this.player2Ctrl = byId(this.renderingSpec.player2ctrl);
		clearChildren(this.player2Ctrl);
		this.messagesContainer = byId(this.renderingSpec.messages);
		clearChildren(this.messagesContainer);
		this.roundsIndicator = byId(this.renderingSpec.rounds);
		this.roundsIndicator.addEventListener('click', ()=>{
			this.run();
		})
		clearChildren(this.roundsIndicator);
		this.attachControls();
		this.writeMessage('Layout ready');
	}

	run() {
		if (this.rounds > this.maxRounds) {
			return this.matchFinished();
		}
		this.roundsIndicator.innerHTML = this.rounds;
		this.players.map((playerType, player) => {
			if (!this.hand[player] && playerType == CPU) {
				this.getHandForPlayer(player);
			}
		})
		if (this.hand[0] && this.hand[1] && this.rounds <= this.maxRounds) {
			this.renderHands();
			const thisRound = this.rounds;
			const winner = this.evaluateHand();
			this.writeMessage(`${thisRound} of ${this.maxRounds} won by: ${OUTCOME_LABELS[winner]}`);
		}
	}

	/*
	 * Evaluate the outcome of a full x round match.
	 */
	matchWinner() {
		let outcomes = [0, 0];
		this.matchLog.map((outcome)=>{
			if (outcome > -1) {
				outcomes[outcome]++;
			}
		})
		if (outcomes[0] == outcomes[1]) {
			return DRAW;
		} else if (outcomes[0] > outcomes[1]) {
			return PLAYER_1
		} else {
			return PLAYER_2
		}
	}

	matchOutcomeSequence(outcome) {
		const p1Img = [-1, 1].indexOf(outcome) > -1 ?
			`<img src="${LOST_IT_IMG}" class="pieceImg"/>` :
			`<img src="${WINNER_IMG}" class="pieceImg"/>`;
		const p2Img = [-1, 0].indexOf(outcome) > -1 ?
			`<img src="${LOST_IT_IMG}" class="pieceImg"/>` :
			`<img src="${WINNER_IMG}" class="pieceImg"/>`;
		this.player1Container.innerHTML = p1Img;
		this.player2Container.innerHTML = p2Img;
	}

	matchFinished() {
		const outcome = this.matchWinner();
		this.writeMessage("This match was won by: " + OUTCOME_LABELS[outcome]);
		this.matchOutcomeSequence(outcome);
		this.reset(true);
	}

	/**
	 * Check if this match evaluate for a winner. This would happen once both
	 * players have taken their turns and the sum of this.state == 2
	 */
	shouldEval() {
		return this.state.reduce((a, b) => a + b, 0) == 2;
	}

	/**
	 * Evaluate the current hand, return the score (draw, player 1 or player 2)
	 * and reset the match to prepare it for the next round.
	 */
	evaluateHand() {
		if (this.hand[PLAYER_1] == this.hand[PLAYER_2]) {
			return this.scoreAndReset(DRAW);
		} else {
			const p1Hand = this.hand[PLAYER_1];
			const p1HandWins = this.rules[p1Hand].wins;
			if (p1HandWins.indexOf(this.hand[PLAYER_2]) > -1 ) {
				return this.scoreAndReset(PLAYER_1);
			} else {
				return this.scoreAndReset(PLAYER_2);
			}
		}
	}

	reset(full=false) {
		this.state = [0, 0];
		this.hand = Array(2);
		if (full) {
			this.rounds = 1;
			this.writeMessage("Again, Again! Lets go again!")
		}
	}

	/**
	 * Reset the match and return the winner, after logging it
	 */
	scoreAndReset(winner) {
		this.reset();
		this.matchLog.push(winner);
		this.rounds++;
		return winner;
	}

	/**
	 * Generate the game controls for each player.
	 */
	generateControls(player) {
		const controls = Object.keys(this.assets);
		const ctrlImages = [...Array(controls.length).keys()];
		controls.map((item, index)=>{
			let attributes = {
				src: this.assets[item]
			}
			let className = this.players[player] == HUMAN ? 'ctrlImg' : 'ctrlImgCpu';
			let el = createEl('img', className, null, attributes);
			el.setAttribute('title', item);
			if (this.players[player] == HUMAN) {
				el.addEventListener('click' , () => {
					this.hand[player] = item;
					this.state[player] = 1;
					this.renderHands();
					console.log("IMAGE CLICK")
					this.run();
				})
			}
			ctrlImages[index] = el;
		})
		return ctrlImages;
	}

	attachControls() {
		this.generateControls(PLAYER_1).map((ctrl) => {
			this.player1Ctrl.appendChild(ctrl);
		})
		this.generateControls(PLAYER_2).map((ctrl) => {
			this.player2Ctrl.appendChild(ctrl);
		})
	}

	/**
	 * Get a random hand for a player
	 * @param [number] either PLAYER_1 or PLAYER_2
	 */
	getHandForPlayer(player) {
		const randHand = Math.floor(Math.random() * Object.keys(this.assets).length);
		this.hand[player] = this.pieces[randHand];
		return this.hand[player];
	}

	renderHands() {
		const imageP1 = this.hand[PLAYER_1] ? this.assets[this.hand[PLAYER_1]] : false;
		const imageP2 = this.hand[PLAYER_2] ? this.assets[this.hand[PLAYER_2]] : false;
		if (imageP1) {
			this.player1Container.innerHTML = `<img src="${imageP1}" class="pieceImg"/>`;
			this.writeMessage('Player 1 threw ' + this.hand[PLAYER_1])
		}
		if (imageP2) {
			this.player2Container.innerHTML = `<img src="${imageP2}" class="pieceImg"/>`;
			this.writeMessage('Player 2 threw ' + this.hand[PLAYER_2])
		}
	}

	/**
	 * Return true if this match is played Computer vs Computer.
	 */
	isFullAutoMode() {
		return this.players[0] == CPU && this.players[1] == CPU;
	}

	/**
	 * some welcoming messages for the players, to make everyone feel at home
	 */
	welcomeMessages() {
		this.writeMessage("Initialising game");
		this.writeMessage("Going to find a rock, a piece of papyrus and scissors");
		this.writeMessage("Solid advice: Never run with scissors!");
		if (this.isFullAutoMode()) {
			this.writeMessage("<strong>FULL AUTO!<BR/>Press the ROUND number to progress</strong>");
		}
	}

	/**
	 * Write a message to the messages container
	 */
	writeMessage(message) {
		const messageBlock = createEl('div', 'message', message);
		this.messagesContainer.insertBefore(messageBlock, this.messagesContainer.firstChild);
	}

	status() {
		return 'OK'
	}

}
