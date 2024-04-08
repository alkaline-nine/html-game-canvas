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
			headerSize: 70,
			timer: 40,
			completeTimer: 25,
			completeColor: 'gainsboro',
			gameOverColor: 'darkred',
			gameColor: 'black',
			headerColor: 'midnightblue',
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
		shapes: {
			'line': [
				[0,-1,0,0,0,1,0,2],
				[-2,0,-1,0,0,0,1,0],
				[0,-1,0,0,0,1,0,2],
				[-2,0,-1,0,0,0,1,0]
			],
			'square': [
				[0,0,0,1,1,0,1,1],
				[0,0,0,1,1,0,1,1],
				[0,0,0,1,1,0,1,1],
				[0,0,0,1,1,0,1,1],
			],
			'left_l': [
				[0,-1,0,0,0,1,1,1],
				[-1,1,-1,0,0,0,1,0],
				[-1,-1,0,-1,0,0,0,1],
				[-1,0,0,0,1,0,1,-1]
			],
			'right_l': [
				[-1,1,0,1,0,0,0,-1],
				[-1,0,-1,1,0,1,1,1],
				[1,-1,0,-1,0,0,0,1],
				[-1,0,0,0,1,0,1,1]
			],
			'left_z': [
				[0,-1,0,0,1,0,1,1],
				[-1,1,0,1,0,0,1,0],
				[0,-1,0,0,1,0,1,1],
				[-1,1,0,1,0,0,1,0],
			],
			'right_z': [
				[1,-1,1,0,0,0,0,1],
				[-1,0,0,0,0,1,1,1],
				[1,-1,1,0,0,0,0,1],
				[-1,0,0,0,0,1,1,1],
			],
			'tee': [
				[0,-1,0,0,0,1,1,0],
				[-1,0,0,0,1,0,0,1],
				[0,-1,0,0,0,1,-1,0],
				[-1,0,0,0,1,0,0,-1],
			]
		},
		gameOver: false,
		keysPressed: [],
		all: [],
		complete: [],
		completeCount: 0,
		curr: undefined,
		next: undefined,
		score: 0
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
		const height = this.gameApi.config().canvas.height = this.gameData.conf.rows * this.gameData.conf.blockSize + this.gameData.conf.headerSize;
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
		this.gameData.score = 0;
		this.gameData.curr = undefined;
		this.gameData.next = undefined;
		this.gameData.all = [];
	}

	/*
	 * Handle inputCallback to start/stop, or push to keysPressed for think time handling
	 */
	this.handleKeypress = (keys) => {
		const keypress = keys.at(0) || -1;
		if (keypress === this.keyEsc) {
			// stop
			this.handleStartStop(true);
		} else if (keypress === this.keyEnter) {
			// toggle active
			this.handleStartStop(this.gameData.active);
		} else {
			this.gameData.keysPressed.push(keypress);
		}
	}

	/*
	 * This will either stop or start the game, resetting gameOver when restarting
	 */
	this.handleStartStop = (stop) => {
		// start or pause
		if (stop) {
			this.gameData.active = false;
			this.gameApi.stopGame();
		} else {
			if (this.gameData.gameOver) {
				this.resetGameOver();
			}
			this.gameData.active = true;
			this.gameApi.startGame();
		}
	}

	/*
	 * Helper to handle directional movement of current block
	 */
	this.handleKeypressMovement = (keypress, data) => {
		//console.log("Handling keypress: " + keypress);
		if (data && data.curr) {
			if (keypress === this.keyUp || keypress == this.keySpace) {
				const nextOrientation = data.curr.orientation + 1 % 4;
				if (this.checkShapeBounds({ ...data.curr, orientation: nextOrientation}, data.all)) {
					console.log('keypress: CANNOT move left, another block or boundary in the way');
				} else {
					data.curr.orientation = nextOrientation;
				}
			} else if (keypress === this.keyDown) {
				data.curr.timer = 0;
			} else if (keypress === this.keyLeft) {
				const nextPx = data.curr.px - 1;
				if (this.checkShapeBounds({ ...data.curr, px: nextPx}, data.all)) {
					console.log('keypress: CANNOT move left, another block or boundary in the way');
				} else {
					data.curr.px = nextPx;
				}
			} else if (keypress === this.keyRight) {
				const nextPx = data.curr.px + 1;
				if (this.checkShapeBounds({ ...data.curr, px: nextPx}, data.all)) {
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
		// check for complete rows for removal and shift down on counter
		this.handleCompleteLines(data);
		// when we don't have curr data, add new one randomly
		if (!data.next) {
			data.next = this.newBlock();
		}
		if (!data.curr) {
			data.curr = data.next;
			data.next = undefined;
		}
		// decrement curr timer and see if its ready to auto-fall...
		if (data.curr.timer-- <= 0) {
			this.handleAutoFallTimer(data);
		}
	}

	/*
	 * This will handle checking if the auto-fall would cause a collision.
	 * Then either let the shape fall by one position, or lock it in to pre-fall position and create new.
	 */
	this.handleAutoFallTimer = (data) => {
		const nextPy = data.curr.py + 1;
		// check fall position for collisions
		if (this.checkShapeBounds({ ...data.curr, py: nextPy}, data.all) === false) {
			// auto-fall
			data.curr.py = nextPy;
			data.curr.timer = this.gameData.conf.timer;
		} else {
			// auto-fall would violate bounds, lock at current position
			const { px, py } = this.startingPosition();
			// check to see if we're still at starting position, which is game over
			if (px === data.curr.px && py === data.curr.py) {
				// TODO: what if locking this shape in starting position clears a line or more? game should continue?
				console.log('locked in starting startingPosition, game over');
				data.gameOver = true;
			} else {
				this.lockShape(data);
				data.curr = data.next;
				data.next = undefined;
			}
		}
	}

	/*
	 * This will handle animating the removal of rows marked for removal
	 */
	this.handleCompleteLines = (data) => {
		// if completeCount zero or less, nothing to do
		if (data.completeCount > 0) {
			// decrement until zero, then remove all rows pending removal and shift other blocks down
			data.completeCount--;
			console.log('decrement completeCount =', data.completeCount);
			if (data.completeCount <= 0 && data.complete.length > 0) {
				data.complete.forEach(py => this.handleCompleteRow(data, py));
				data.complete = [];
			}
		}
	}

	/*
	 * This will handle removing a single row at py, and shifting down locked blocks above (less than) py
	 */
	this.handleCompleteRow = (data, py) => {
		console.log('removing row py =', py);
		console.log('total blocks before removal =', data.all.length);
		// filter out any blocks in py row...
		data.all = data.all.filter(block => block.py !== py).map(block => {
			// ...and shift down (add to py) and rows with a py < row py
			if (block.py < py) {
				block.py = block.py + 1;
			}
			return block;
		});
		console.log('total blocks after removal =', data.all.length);
	}

	/*
	 * This will handle identifying any rows that are "complete" and ready to mark for removal
	 */
	this.checkCompleteLines = (data) => {
		let linesComplete = 0;
		// check each y row for complete, starting at the top, since rows above need to fall
		for (py = 0; py < data.conf.rows; py++) {
			console.log('checking complete for py =', py);
			// if complete, mark for removal
			if (this.checkCompleteRow(data, py)) {
				console.log('mark complete for py =', py);
				this.markCompleteRow(data, py);
				linesComplete++;
			}
		};
		if (linesComplete > 0) {
			// 100 points per line
			this.addScore(linesComplete * 100);
			// plus bonus for 3 or 4
			if (linesComplete > 2) {
				this.addScore(1000 * (linesComplete - 2));
			}
		}
	}

	/*
	 * This will handle identifying if the row at py is "complete"
	 */
	this.checkCompleteRow = (data, py) => {
		// filter/reduce down to every px with a matching py
		const pxs = data.all.filter(block => block.py === py).map(block => block.px);
		// then make sure the list of pxs includes every column
		for (px = 0; px < data.conf.cols; px++) {
			if (!pxs.includes(px)) {
				return false;
			}
		}
		// true when all included
		return true;
	}

	/*
	 * This will handle modifying to each complete row block and adding the row py to complete list
	 */
	this.markCompleteRow = (data, py) => {
		// set removal color on every block with a matching py
		data.all.filter(block => block.py === py).forEach(block => {
			block.color = data.conf.completeColor;
		});
		// and add py to complete data, resetting removal timer
		data.complete.push(py);
		data.completeCount = data.conf.completeTimer;
	}

	/*
	 * This will return true when any block within the current shape is overlapping another block or boundary
	 */
	this.checkShapeBounds = (block, all) => {
		const shape = this.gameData.shapes[`${block.shape}`];
		const xys = shape[block.orientation % shape.length];
		const color = block.color;
		let shapeBounds = false;
		for (skip = 0; skip < 8 && !shapeBounds; skip += 2) {
			let px = block.px + xys[0 + skip];
			let py = block.py + xys[1 + skip];
			shapeBounds = checkBounds(px, py, all);
		}
		return shapeBounds;
	}

	/*
	 * This will return true when x,y is overlapping another block or boundary
	 */
	this.checkBounds = (px, py, all) => {
		// check x,y against bounds of board
		if (
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

	/*
	 * This will take the curr shape and convert to individual blocks to lock, and then check for complete lines
	 */
	this.lockShape = (data) => {
		// each piece of the shape gets its own block
		const shape = data.shapes[`${data.curr.shape}`];
		const xys = shape[data.curr.orientation % shape.length];
		// grab in pairs, jump by 2 each loop
		for (skip = 0; skip < 8; skip += 2) {
			let px = data.curr.px + xys[0 + skip];
			let py = data.curr.py + xys[1 + skip];
			data.all.push({px, py, color: data.curr.color});
		}
		// bump score for each locked shape
		this.addScore(5);
		// then check for new complete rows
		this.checkCompleteLines(data);
	}

	this.addScore = (plusScore) => {
		this.gameData.score += plusScore;
	}

	this.newColor = () => {
		return this.gameData.colors[this.gameApi.random(this.gameData.colors.length)];
	}

	this.newShape = () => {
		// small even number modulus from RNG are not well spread
		// ...use a larger random max then modulus again
		const shapes = Object.keys(this.gameData.shapes);
		const shapeIdx = this.gameApi.random(123456789) % shapes.length;
		const shape = shapes[shapeIdx];
		return shape;
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
		const shape = this.newShape();
		const orientation = 0;
		return {
			px,
			py,
			color,
			shape,
			orientation,
			timer: this.gameData.conf.timer
		};
	}

	this.renderShape = (ctx, block, blockSize) => {
		const shape = this.gameData.shapes[`${block.shape}`];
		const xys = shape[block.orientation % shape.length];
		const color = block.color;
		for (skip = 0; skip < 8; skip += 2) {
			let px = block.px + xys[0 + skip];
			let py = block.py + xys[1 + skip];
			renderBlock(ctx, {color, px, py}, blockSize)
		}
	}

	this.renderBlock = (ctx, block, blockSize) => {
		//console.log('rendering block x/y/s=', block.px, block.py, blockSize);
		this.gameApi.drawUtil({ 
			type: 'rect', 
			c: block.color,
			x: block.px * blockSize, 
			y: block.py * blockSize + this.gameData.conf.headerSize, 
			dx: blockSize, 
			dy: blockSize
		});
	}

	this.renderHeader = (ctx, conf, color) => {
		// draw a different color background
		this.gameApi.drawUtil({ 
			type: 'rect', 
			c: color,
			x: 0, 
			y: 0, 
			dx: conf.cols * conf.blockSize, 
			dy: conf.headerSize
		});
		ctx.fillStyle = "white";
		ctx.font = "16px serif";
		ctx.fillText("Score: " + this.gameData.score, conf.cols * conf.blockSize * 0.78, conf.headerSize * 0.9);
		if (this.gameData.gameOver) {
  			ctx.fillText("G A M E  O V E R ! !", 4, conf.headerSize * 0.9);
		} else if (this.gameData.next) {
  			ctx.fillText("Next:", 4, conf.headerSize * 0.9);
			const nextShape = {
				orientation: 1, 
				color: this.gameData.next.color, 
				shape: this.gameData.next.shape,
				px: 3,
				py: -2
			};
			this.renderShape(ctx, nextShape, conf.blockSize);
		}
	}

	this.renderBackground = (ctx, conf, color) => {
		// draw a different color background
		this.gameApi.drawUtil({ 
			type: 'rect', 
			c: color,
			x: 0, 
			y: 0, 
			dx: conf.cols * conf.blockSize, 
			dy: conf.rows * conf.blockSize + conf.headerSize
		});
	}

	/*
	 * Render each cycle
	 */
	this.renderLayer = (idx, count, data, ctx) => {
		//console.log('rendering layer idx=', idx);
		if (data.gameOver) {
			this.renderBackground(ctx, data.conf, data.conf.gameOverColor);
		} else {
			this.renderBackground(ctx, data.conf, data.conf.gameColor);
		}
		this.renderHeader(ctx, data.conf, data.conf.headerColor);
		// once locked, all shapes are saved as individual blocks, so renderBlock()
		data.all.forEach(d => this.renderBlock(ctx, d, data.conf.blockSize));
		if (data.curr) {
			this.renderShape(ctx, data.curr, data.conf.blockSize);
		}
	}

})();
