require('../css/main.scss');

import print from './module';
import RockPaperScissors from './rockpaper';

const renderSpec = {
	player1: 'player1',
	player1ctrl: 'player1Ctrl',
	player2: 'player2',
	player2ctrl: 'player2Ctrl',
	messages: 'messages'
};
window.rps = new RockPaperScissors(renderSpec);
print(window.rps.status());
