/**
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
 *
 */
const PLAYER_1 = 0;
const PLAYER_2 = 1;
const HUMAN = 'H';
const CPU = 'C';
const ROCK = 0;
const PAPER = 1;
const SCISSORS = 2;
const assets = {
	0: 'http://www.dododex.com/media/item/Stone.png',
	1: 'http://eliteownage.com/paper.jpg',
	2: 'http://findicons.com/files/icons/196/office_tools/128/scissors.png'
}

const byId = function(id) {
	return document.getElementById(id);
}

const createEl = function(elementType, elementClass, content=null, attributes=null) {
	const element = document.createElement(elementType);
	element.className = elementClass;
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
	constructor(renderingSpec) {
		this.renderingSpec = renderingSpec;
		console.log('constructor', this, arguments)
		// this match's players
		this.players = [HUMAN, CPU];
		// current player
		this.currentPlayer = PLAYER_1;
		// all the game 'pieces'
		this.pieces = [ROCK, PAPER, SCISSORS];
		// current played hand
		this.hand = Array(2);
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
		this.prepareHands();
		this.renderHands();

	}

	generateControls(player) {
		const controls = [...Array(3).keys()];
		controls.map((item, index)=>{
			console.log(item, index);
			let attributes = {
				src: assets[index]
			}
			let el = createEl('img', 'ctrlImg', null, attributes);
			el.addEventListener('click' , () => {
				this.writeMessage(player + " CLICKED " + index);
			})
			controls[index] = el;
		})
		return controls;
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

	prepareHands() {
		this.getHandForPlayer(PLAYER_1);
		this.getHandForPlayer(PLAYER_2);
	}

	renderHands() {
		this.player1Container.innerHTML = `<img src="${assets[this.hand[PLAYER_1]]}" class="pieceImg"/>`;
		this.player2Container.innerHTML = `<img src="${assets[this.hand[PLAYER_2]]}" class="pieceImg"/>`;
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
