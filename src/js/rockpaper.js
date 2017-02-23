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
 * 	player1: '#player1container',
 * 	player1ctrl: '#player1Ctrl',
 * 	player2: '#player2container',
 * 	player2ctrl: '#player2Ctrl',
 * 	messages: '#statusContainer'
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
const WAIT_IMG = 'http://www.threadbombing.com/data/media/2/xgllya.gif';
const DEFAULT_ASSETS = {
	'rock': 'http://www.dododex.com/media/item/Stone.png', // ROCK
	'paper': 'http://eliteownage.com/paper.jpg', // PAPER
	'scissors': 'http://findicons.com/files/icons/196/office_tools/128/scissors.png' // SCISSORS
}
const DEFAULT_RULES = {
	'rock': {wins: [2]},
	'paper': {wins: [0]},
	'scissors': {wins: [1]}
}
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

export default class RockPaperScissors {
	constructor(renderingSpec, assets=null, rules=null, rounds=null) {
		this.renderingSpec = renderingSpec;
		console.log('constructor', this, arguments)
		// setup the assets and rules if provided or use the default
		this.assets = assets || DEFAULT_ASSETS;
		this.rules = rules || DEFAULT_RULES;
		// a log of match outcomes
		this.matchLog = [];
		// this match's players
		this.players = [CPU, CPU];
		// current player
		this.currentPlayer = PLAYER_1;
		// all the game 'pieces'
		this.pieces = Object.keys(this.assets);
		// current played hand
		this.hand = Array(2);
		// state of players played. When this array's sum is 1, eval should happen
		this.state = [0, 0];
		this.maxRounds = rounds || DEFAULT_NUM_OF_ROUNDS;
		this.rounds = 0;
		this.initialiseGame();
	}

	/**
	 * Initialise the layout elements required to render to based on the
	 * provided rendering spec
	 */
	initialiseLayout() {
		this.player1Container = byId(this.renderingSpec.player1);
		this.player1Ctrl = byId(this.renderingSpec.player1ctrl);
		this.player2Container = byId(this.renderingSpec.player2);
		this.player2Ctrl = byId(this.renderingSpec.player2ctrl);
		this.messagesContainer = byId(this.renderingSpec.messages);
		this.attachControls();
		this.writeMessage('Layout ready');
	}

	/**
	 * Prepare a new game
	 */
	initialiseGame() {
		this.initialiseLayout();
		this.welcomeMessages();
		this.run();
	}

	run() {
		if (this.rounds >= this.maxRounds) {
			this.rounds = 1;
			this.writeMessage(this.matchLog.join('-'))
			return;
		}
		this.players.map((playerType, player) => {
			let otherPlayer = 1 - player;
			let cpuPlayed = false;
			console.log("P", player, "T", playerType, "this:", this.state[player], "Other", this.state[otherPlayer])
			if (playerType == CPU && this.state[player] == 0 &&
				(this.state[otherPlayer] == 1 || this.players[otherPlayer] == CPU)) {
				console.log("COMPUTER PLAY", playerType, player)
				this.getHandForPlayer(player);
				this.state[player] = 1;
				this.renderHands();
				console.log("HAND AFTER CPU", this.hand);
				cpuPlayed = true;
			}
			if (this.shouldEval()) {
				const winner = this.evaluateHand();
				this.writeMessage("WINNER IS " +  winner);
			} else if (this.state[otherPlayer] == 0 && this.players[otherPlayer] == CPU && cpuPlayed) {
				console.log("RUN AGAIN")
				this.run()
			}
		})

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

	/**
	 * Reset the match and return the winner, after logging it
	 */
	scoreAndReset(winner) {
		this.state = [0, 0];
		this.hand = Array(2);
		this.matchLog.push(winner);
		this.rounds++;
		console.log("WINNER IS ", winner)
		return winner;
	}

	/**
	 * Generate the game controls for each Human player.
	 */
	generateControls(player) {
		const ctrlImages = [...Array(3).keys()];
		const controls = Object.keys(this.assets); //
		controls.map((item, index)=>{
			let attributes = {
				src: this.assets[item]
			}
			let el = createEl('img', 'ctrlImg', null, attributes);
			if (this.players[player] == HUMAN) {
				el.addEventListener('click' , () => {
					this.writeMessage(player + " CLICKED " + item);
					this.hand[player] = item;
					this.state[player] = 1;
					console.log("STATE AFTER CLICK", this.state, "HAND IS", this.hand)
					this.renderHands();
					this.run();
				})
			}
			ctrlImages[index] = el;
		})
		return ctrlImages;
	}

	attachControls() {
		this.generateControls(PLAYER_1).map((ctrl) => {
			console.log(ctrl)
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
		const randHand = Math.floor(Math.random() * 3);
		this.hand[player] = this.pieces[randHand];
		return this.hand[player];
	}

	renderHands() {
		console.log("RENDER", this.hand)
		const imageP1 = this.hand[PLAYER_1] ? this.assets[this.hand[PLAYER_1]] : WAIT_IMG;
		const imageP2 = this.hand[PLAYER_2] ? this.assets[this.hand[PLAYER_2]] : WAIT_IMG;
		this.player1Container.innerHTML = `<img src="${imageP1}" class="pieceImg"/>`;
		this.player2Container.innerHTML = `<img src="${imageP2}" class="pieceImg"/>`;
	}

	/**
	 * some welcoming messages for the players, to make everyone feel at home
	 */
	welcomeMessages() {
		this.writeMessage("Initialising game");
		this.writeMessage("Going to find a rock, a piece of papyrus and scissors");
		this.writeMessage("Life advice: Never run with scissors!");
	}

	/**
	 * Write a message to the messages container
	 */
	writeMessage(message) {
		const messageBlock = createEl('div', 'message', `<div class="message">${message}</div>`);
		this.messagesContainer.insertBefore(messageBlock, this.messagesContainer.firstChild);
	}

	status() {
		return 'OK'
	}

}
