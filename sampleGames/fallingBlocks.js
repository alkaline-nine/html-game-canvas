"use strict";
/*
 *  Sample game using the game engine
 */
(function () {
	console.log('Loading window.fallingBlocks...');
	window.fallingBlocks = this;

	/* 
	 * The gameApi is required to run this sample game
	 */
	this.gameApi = undefined;
	this.init = (gameApi) => {
		// attach the gameApi
		this.gameApi = gameApi;
		// add custom keyboard controls
		this.initControls();
		// add custom layer data
		this.initLayers();
		console.log('...fallingBlocks initialized');
		this.gameApi.startGame();
	}
 
	/* 
	 * Some example keys to handle by keyCode
	 */
	this.keyEnter = 13;
	this.keyEsc = 27;
	this.keySpace = 32;
	this.keyLeft = 37;
	this.keyUp = 38;
	this.keyRight = 39;
	this.keyDown = 40;

	this.gameData = {
		active: true,
		conf: {
			cols: 14,
			rows: 20,
			blockSize: 33,
			timer: 40,
			count: 1000000
		},
		colors: [
			'blue',
			'green',
			'red',
			'magenta',
			'yellow',
			'cyan',
			'darkgrey',
		],
		keysPressed: [],
		all: [],
		curr: undefined
	}

	/* 
	 * Simple example of game control init with some typical arrow key codes
	 */
	this.initControls = () => {
		// setup handling for key presses by numeric value in array format
		// ...set keys to monitor by passing array of keyCodes (numbers)
		this.gameApi.keys([
			this.keyEnter, 
			this.keyEsc, 
			this.keySpace, 
			this.keyUp, 
			this.keyDown, 
			this.keyLeft, 
			this.keyRight]);
		// ...and a callback function that will fire every cycle for new input
		this.gameApi.inputCallback(this.handleKeypress);
		console.log("Setup controls for game canvas engine = " + JSON.stringify(this.gameApi.config().input.keys));
	}

	/* 
	 * Simple example of game layer init on to the otherwise empty canvas
	 */
	this.initLayers = () => {
		// override the canvas config if desired
		// ...width/height changes take effect once upon startGame()
		const width = this.gameApi.config().canvas.width = this.gameData.conf.cols * this.gameData.conf.blockSize;
		const height = this.gameApi.config().canvas.height = this.gameData.conf.rows * this.gameData.conf.blockSize;
		console.log("Width/Height for game canvas engine = " + width + ":" + height);
		// add minimal config to let this code think and render itself
		const layer = {
			think: this.thinkLayer,
			render: this.renderLayer,
			data: this.gameData
		};
		this.gameApi.addLayer(layer);
		console.log("Adding object to html game canvas engine");
	}

	/*
	 * Simple example of an inputCallback function to handle keys array
	 * @param keys (array of numbers) representing sequential keypresses by keyCode
	 */
	this.handleKeypress = (keys) => {
		const keypress = keys.at(0) || -1;
		if (keypress === this.keyEsc) {
			// stop
			console.log('keypress: active = false');
			this.gameData.active = false;
			this.gameApi.stopGame();
		} else if (keypress === this.keyEnter) {
			// start
			console.log('keypress: active = true');
			this.gameData.active = true;
			this.gameApi.startGame();
		} else {
			this.gameData.keysPressed.push(keypress);
			console.log("keypress: queue =", this.gameData.keysPressed);
		}
		console.log("Handled keypress: " + keypress);
	}

	this.handleKeypressMovement = (keypress, data) => {
		console.log("Handling keypress: " + keypress);
		if (data && data.curr) {
			if (keypress === this.keyUp) {
				// TODO: rotate
				data.curr.py = data.curr.py - 1;
				console.log('keypress: UP = ROTATE');
			} else if (keypress === this.keyDown) {
				data.curr.timer = 0;
				console.log('keypress: DOWN = FAST DROP');
			} else if (keypress === this.keyLeft) {
				if (data.curr.px > 0) {
					data.curr.px = data.curr.px - 1;
				}
				console.log('keypress: LEFT = MOVE LEFT');
			} else if (keypress === this.keyRight) {
				if (data.curr.px < data.conf.cols - 1) {
					data.curr.px = data.curr.px + 1;
				}
				console.log('keypress: RIGHT = MOVE RIGHT');
			} else {
				console.log("keypress: UNKNOWN ", keypress);
			}
		}
	}

	/* 
	 * Simple example of using the data stored in the game canvas to "think" for each obj each cycle
	 * @param idx (number) in the layer stack, used in removeLayer(idx)
	 * @param count (number) of cycles since last reset via startGame()
	 * @param data (obj) layer.data as added in addLayer(layer)
	 */
	this.thinkLayer = (idx, count, data) => {
		//console.log('thinking layer idx=', idx);
		// check pending keypress
		if (this.gameData.keysPressed.length > 0) {
			//console.log("Thinking keypress: HANDLING ", this.gameData.keysPressed.length);
			this.gameData.keysPressed.forEach(k => this.handleKeypressMovement(k, data));
			this.gameData.keysPressed = [];
		}
		// when we don't have curr data, add new one randomly
		if (!data.curr) {
			//console.log("Adding new curr");
			data.curr = this.newBlock();
		}
		// then decide if curr is ready to move
		if (data.curr.timer <= 0) {
			//console.log("Checking curr movable");
			// if curr has hit a boundary. lock it
			if (this.checkBounds(data.curr, data.all) === false) {
				//console.log("Moving curr");
				data.curr.py = data.curr.py + 1;
				data.curr.timer = this.gameData.conf.timer;
			}
			if (this.checkBounds(data.curr, data.all) === true) {
				//console.log("Lock curr");
				data.all.push(data.curr);
				data.curr = undefined;
			}
		} else {
			// always decrement curr timer
			//console.log("Timer curr=" + data.curr.timer);
			data.curr.timer--;
			// hard stop after xx cycles for testing
			if (count > this.gameData.conf.count) {
				console.log("Hard Stop");
				this.gameApi.stopGame();
			}
		}
	}

	this.checkBounds = (block, all) => {
		const cx = block.px;
		const cy = block.py + 1;
		if (cy >= this.gameData.conf.rows) {
			return true;
		}
		if (Array.isArray(all)) {
			const hit = all.filter((lb) => lb.py === cy && lb.px === cx);
			return hit.length > 0;
		}
		return false;
	}

	this.newColor = () => {
		return this.gameData.colors[this.gameApi.random(this.gameData.colors.length)];
	}

	this.newBlock = () => {
		return {
			py: 0,
			px: this.gameData.conf.cols/2 - 1,
			color: this.newColor(),
			timer: this.gameData.conf.timer
		};
	}

	this.renderBlock = (ctx, block, blockSize) => {
		//console.log('rendering block x/y/s=', block.px, block.py, blockSize);
		this.gameApi.drawUtil({ 
			type: 'rect', 
			c: block.color,
			x: block.px *  + blockSize, 
			y: block.py *  + blockSize, 
			dx: blockSize, 
			dy: blockSize
		});
	}

	/*
	 * Simple example of using the data stored in the game canvas to "render" each obj each cycle
	 * @param idx (number) in the layer stack
	 * @param count (number) of cycles since last reset via startGame()
	 * @param data (obj) layer.data as added in addLayer(layer)
	 * @param ctx (canvas 2D context) to perform actual rendering
	 */
	this.renderLayer = (idx, count, data, ctx) => {
		//console.log('rendering layer idx=', idx);
		data.all.forEach(d => this.renderBlock(ctx, d, data.conf.blockSize));
		if (data.curr) {
			this.renderBlock(ctx, data.curr, data.conf.blockSize);
		}
	}

})();
