# Gumtree UK frontend developer test

This is my submission. Its been a fun headcleaner exercise. Thank you.   
Since I've been aiming at an MVP level delivery, I've didn't go for high end looks, but instead opted for good extensible functionality with adequate UI, and using vanilla JavaScript only. No libraries were harmed in the making of this game.

### Rating
This game is rated R due to mature content.

### Gameplay
Human players select the piece they want to throw to progress the game forward. When the computer battles its alter ego, pressing the *Round* number will progress the match further.

### Overview

*Rock Paper Scissors Whatever* is more of a framework for making Rock-Paper-Scissors games. The game 'engine' is decoupled from the DOM, the presentation assets and even the rules of the game.

RPS can be played with 2 Humans, 2 Computers or Human vs Machine.  

The game itself can be instantiated without any arguments and will use a set of defaults matching a traditional RPS game with 3 rounds matches and a set of default DOM elements to be used as presentation containers. Alternatively a set of arguments can be provided to turn this into any variant of RPS that is required, and fit into any UI layout.  

The constructor signature is :

```
(players=null, renderingSpec=null, assets=null, rules=null, rounds=null)
```

* `players`: an array of two elements with either 'H' or 'C' to determine the type of players participating. The bleeding kind, or the electric kind.
* `renderingSpec`: An object with the following signature, containing the ids of DOM elements to render the UI into:
```
{
	player1: 'container for player 1 hand',
	player1ctrl: 'container for player 1 controls',
	player2: 'container for player 2 hand',
	player2ctrl: 'container for player 2 controls',
	messages: 'container for messages panel',
	rounds: 'container for round indicator'
}
```
* `assets`: An object whose keys are the name of the 'pieces' and values are  urls to images that represent them. For example, the default assets for traditional RPS are:
```
{
	'rock': 'http://www.dododex.com/media/item/Stone.png', // ROCK
	'paper': 'http://eliteownage.com/paper.jpg', // PAPER
	'scissors': 'http://findicons.com/files/icons/196/office_tools/128/scissors.png' // SCISSORS
}
```
* `rules`: An object containing the rules of engagement. Each key should correspond one of the `assets` keys provided, and the value is an object describing which 'other' keys this piece wins.
```
{
	'rock': {wins: ['scissors']},
	'paper': {wins: ['rock']},
	'scissors': {wins: ['paper']}
}
```
* `rounds`: The number of rounds per match (default=3)

The game comes with 3 edition presets. One for a traditional RPS setup, one for the *Meme Edition*, and one for the *Lizard Spock* variant (who came up with that???)

### Tests
The code comes with a set of unit tests I thought were adequate.


### Further steps
Things can always be better, and this being MVP means a lot of things can be improved on. The UX can be more unified as far as the differences in gameplay mechanics between H-C and C-C games. The game is tested responsive in a browser emulator but not on actual devices. As well, responsiveness is set up for a generic range of viewports, not a specific set of actual real world devices. 
