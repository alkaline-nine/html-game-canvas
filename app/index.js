// Find the render canvas by default name
var renderCanvas = document.getElementById('html_game_canvas');
var rendCtx = renderCanvas.getContext('2d');
console.log(`Found canvas:             ${renderCanvas.innerHTML}\n\n`);
console.log(`Found canvas context:     ${rendCtx.canvas.innerHTML}\n\n`);

// Load framework objects
import Configuration from './configuration.js';
import MarsagliaRandom from './marsaglia.js';
import KeyInput from './keyinput.js';
import Layers from './layers.js';
import Gamer from './gamer.js';

var gameCanvas = {
	core: {
		conf: undefined,
		rando: undefined,
		input: undefined,
		layers: undefined,
		game: undefined,
	},
	api: {
		// game engine (think,render,increment,repeat) can be started/stopped
		startGame: () => { return gameCanvas.core.game.startGame(); },
		stopGame: () => { return gameCanvas.core.game.stopGame(); },
		// layers are the objects that think and render each render cycle
		addLayer: (layer) => { return gameCanvas.core.layers.addLayer(layer); },
		removeLayer: (layerIdx) => { return gameCanvas.core.layers.removeLayer(layerIdx); },
		// get config object to modify if desired
		config: () => { return gameCanvas.core.conf.config; },
		// built in random helper
		random: (x) => { return gameCanvas.core.rando.random(x); },
		// setup keys to listen on, and a callback when input is collected
		keys: (k) => { return gameCanvas.core.input.setKeys(k); },
		inputCallback: (callback) => { gameCanvas.core.input.setCallback(callback); },
	}
};

(function () {
	"use strict";
	renderCanvas.innerHTML = 'Initializing and Starting Up!';
	console.log('Game module init...');

	console.log('DOM: Identifying/Creating DOM elems');
	console.log(`DOM: canvas: ${renderCanvas.innerHTML}\n\n`);

	console.log('Configuration: Loading base objects');
	var conf = gameCanvas.core.conf = new Configuration();
	var config = conf.config;
	console.log(`Configuration: pre-init config: ${JSON.stringify(config, null, 2)}\n\n`);

	var rando = gameCanvas.core.rando = new MarsagliaRandom();
	console.log('PRNG: initialized marsaglia psuedo random number generator with seed=' + "default");

	console.log('KeyInput: Loading keyboard handler');
	var input = gameCanvas.core.input = new KeyInput(config);
	console.log(`KeyInput: ${JSON.stringify(input.inputs, null, 2)}\n\n`);

	console.log('Layers: Loading layers');
	var layers = gameCanvas.core.layers = new Layers(config);
	console.log(`Layers: ${JSON.stringify(layers.data, null, 2)}\n\n`);

	console.log('Gamer: Loading game controller');
	var game = gameCanvas.core.game = new Gamer(config, input, layers, renderCanvas);
	console.log(`Gamer: ${game.canvas.innerHTML}\n\n`);
})();

console.log('Game modules loaded');

// setup event listener for key input
window.addEventListener('keydown', (event) => { gameCanvas.core.input.handleKeys(event); });

// setup bridge to api in the window.gameCanvas obj
window.gameCanvas = gameCanvas;

// is this needed?
export default gameCanvas;
