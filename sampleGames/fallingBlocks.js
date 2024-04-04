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
			//count: 1000000
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
		gameOver: false,
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
		console.log("Added object to html game canvas engine");
	}

	/*
	 * Reset all data and gameOver flag
	 */
	this.resetGameOver = () => {
		this.gameData.gameOver = false;
		this.gameData.curr = undefined;
		this.gameData.all = [];
	}

	/*
	 * Handle inputCallback to start/stop, or push to keysPressed for think time handling
	 */
	this.handleKeypress = (keys) => {
		const keypress = keys.at(0) || -1;
		if (keypress === this.keyEsc) {
			// stop
			this.gameData.active = false;
			this.gameApi.stopGame();
		} else if (keypress === this.keyEnter) {
			// start
			if (this.gameData.gameOver) {
				this.resetGameOver();
			}
			this.gameData.active = true;
			this.gameApi.startGame();
		} else {
			this.gameData.keysPressed.push(keypress);
		}
	}

	/*
	 * Helper to handle directional movement of current block
	 */
	this.handleKeypressMovement = (keypress, data) => {
		//console.log("Handling keypress: " + keypress);
		if (data && data.curr) {
			if (keypress === this.keyUp) {
				// TODO: rotate... for now actually move block up
				data.curr.py = data.curr.py - 1;
			} else if (keypress === this.keyDown) {
				data.curr.timer = 0;
			} else if (keypress === this.keyLeft) {
				const nextPx = data.curr.px - 1;
				if (checkBounds(nextPx, data.curr.py, data.all)) {
					console.log('keypress: CANNOT move left, another block or boundary in the way');
				} else {
					data.curr.px = nextPx;
				}
			} else if (keypress === this.keyRight) {
				const nextPx = data.curr.px + 1;
				if (checkBounds(nextPx, data.curr.py, data.all)) {
					console.log('keypress: CANNOT move right, another block or boundary in the way');
				} else {
					data.curr.px = nextPx;
				}
			} else {
				console.log("keypress: UNKNOWN ", keypress);
			}
		}
	}

	/* 
	 * Think on the current block 
	 * ...first handling input
	 * ...then seeing if its time to auto-fall (or just decrement wait counter)
	 * ...and doing bounds checks after movement
	 */
	this.thinkLayer = (idx, count, data) => {
		// stop game engine when gameover
		if (data.gameOver) {
			data.active = false;
			this.gameApi.stopGame();
			return;
		}
		// check pending keypress, handle all, then clear
		if (this.gameData.keysPressed.length > 0) {
			this.gameData.keysPressed.forEach(k => this.handleKeypressMovement(k, data));
			this.gameData.keysPressed = [];
		}
		// when we don't have curr data, add new one randomly
		if (!data.curr) {
			data.curr = this.newBlock();
		}
		// then decide if curr is ready to move
		if (data.curr.timer <= 0) {
			// if auto-fall of curr is not hitting a boundary or other block, update curr position
			const nextPy = data.curr.py + 1;
			if (this.checkBounds(data.curr.px, nextPy, data.all) === false) {
				// auto-fall
				data.curr.py = nextPy;
				data.curr.timer = this.gameData.conf.timer;
			} else {
				// auto-fall would violate bounds, locked at current position
				// ...additional check to see if we're still at starting position, which is game over
				const { px, py } = this.startingPosition();
				if ( px === data.curr.px && py === data.curr.py) {
					console.log('locked in starting startingPosition, game over');
					data.gameOver = true;
				} else {
					data.all.push(data.curr);
					data.curr = undefined;
				}
			}
		} else {
			// always decrement curr timer
			data.curr.timer--;
		}
	}

	/*
	 * This will return true when x,y is overlapping another block or boundary
	 */
	this.checkBounds = (px, py, all) => {
		// check x,y against bounds of board
		if (py < 0 ||
			py >= this.gameData.conf.rows ||
			px < 0 ||
			px >= this.gameData.conf.cols
		) {
			return true;
		}
		// check x,y against all other blocks
		if (Array.isArray(all)) {
			const hit = all.filter((b) => b.py === py && b.px === px);
			return hit.length > 0;
		}
		return false;
	}

	this.newColor = () => {
		return this.gameData.colors[this.gameApi.random(this.gameData.colors.length)];
	}

	this.startingPosition = () => {
		return { 
			px: this.gameData.conf.cols/2 - 1, 
			py: 0
		}; 
	}

	this.newBlock = () => {
		const { px, py } = this.startingPosition();
		const color = this.newColor();
		return {
			px,
			py,
			color,
			timer: this.gameData.conf.timer
		};
	}

	this.renderBlock = (ctx, block, blockSize) => {
		//console.log('rendering block x/y/s=', block.px, block.py, blockSize);
		this.gameApi.drawUtil({ 
			type: 'rect', 
			c: block.color,
			x: block.px * blockSize, 
			y: block.py * blockSize, 
			dx: blockSize, 
			dy: blockSize
		});
	}

	this.renderBackground = (ctx, conf, color) => {
		// draw a different color background
		this.gameApi.drawUtil({ 
			type: 'rect', 
			c: color,
			x: 0, 
			y: 0, 
			dx: conf.cols * conf.blockSize, 
			dy: conf.rows * conf.blockSize
		});
	}

	/*
	 * Render each cycle
	 */
	this.renderLayer = (idx, count, data, ctx) => {
		//console.log('rendering layer idx=', idx);
		if (data.gameOver) {
			this.renderBackground(ctx, data.conf, 'darkred');
		}
		data.all.forEach(d => this.renderBlock(ctx, d, data.conf.blockSize));
		if (data.curr) {
			this.renderBlock(ctx, data.curr, data.conf.blockSize);
		}
	}

})();
