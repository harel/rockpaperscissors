import print from '../src/js/module';
import RockPaperScissors from '../src/js/rockpaper';

/**
 * Set up the dom elements required for the game rendering
 */
function setupDomElements() {
	const DEFAULT_RENDER_SPEC = {
		player1: 'player1',
		player1ctrl: 'player1Ctrl',
		player2: 'player2',
		player2ctrl: 'player2Ctrl',
		messages: 'messages',
		rounds: 'roundIndicator'
	};
	let key;
	for (key in DEFAULT_RENDER_SPEC) {
		let el = document.createElement('div');
		el.setAttribute('id', DEFAULT_RENDER_SPEC[key]);
		document.body.appendChild(el);
	}
}

describe('RockPaperScissors object', () => {
	before(() => {
		setupDomElements();
	});

	it('should initialise with defaults when called without arguments', () => {
		// this test does not assume to know what the defaults are,
		// just that defaults are all assigned
		const rps = new RockPaperScissors();
		expect(rps.assets.rock).not.to.equal(undefined);
		expect(rps.assets.paper).not.to.equal(undefined);
		expect(rps.assets.scissors).not.to.equal(undefined);
		expect(rps.rules.rock).not.to.equal(undefined);
		expect(rps.rules.paper).not.to.equal(undefined);
		expect(rps.rules.scissors).not.to.equal(undefined);
	})

	it('should initialise control panels as many elements as there are assets', () => {
		const rps = new RockPaperScissors();
		const p1Ctrl = document.getElementById(rps.renderingSpec.player1ctrl);
		const p2Ctrl = document.getElementById(rps.renderingSpec.player2ctrl);
		expect(p1Ctrl.children.length).to.equal(Object.keys(rps.assets).length);
		expect(p2Ctrl.children.length).to.equal(Object.keys(rps.assets).length);
	})

	it('should start the first round in a CPU vs CPU match and render hand', () => {
		const rps = new RockPaperScissors(['C', 'C']);
		const allAssetUrls = Object.values(rps.assets);
		rps.run();
		const p1Hand = document.getElementById(rps.renderingSpec.player1);
		const p2Hand = document.getElementById(rps.renderingSpec.player1);
		expect(p1Hand.firstChild.tagName).to.equal('IMG');
		expect(p2Hand.firstChild.tagName).to.equal('IMG');
		expect(allAssetUrls).to.contain(p1Hand.firstChild.src);
		expect(allAssetUrls).to.contain(p2Hand.firstChild.src);
	})

	it('should increase the round count by 1 after first init run', () => {
		const rps = new RockPaperScissors(['C', 'C']);
		expect(rps.rounds).to.equal(2);
	})

	it('should log the round winner (one log after init run)', () => {
		const rps = new RockPaperScissors(['C', 'C']);
		expect(rps.matchLog.length).to.equal(1);
	})

	it('should determine the winner after n rounds', () => {
		const rps = new RockPaperScissors(['C', 'C']);
		while (rps.rounds < rps.maxRounds) {
			rps.run();
		}
		expect([-1, 0, 1]).to.contain(rps.matchWinner());
	})

	it('should return true checking if in full Auto', () => {
		const rps = new RockPaperScissors(['C', 'C']);
		expect(rps.isFullAutoMode()).to.equal(true);
	})

	it('should write a message to the messages panel', () => {
		const rps = new RockPaperScissors(['C', 'C']);
		const msgs = document.getElementById(rps.renderingSpec.messages);
		rps.writeMessage('test message 123');
		expect(msgs.firstChild.innerHTML).to.equal('test message 123');
	})
});
