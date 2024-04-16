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
	this.init = (api) => {
		const conf = this.gameData.conf;
		// attach the gameApi
		this.gameApi = api;
		// add custom keyboard (and touch/click) controls
		this.initControls(api, conf);
		// add custom layer data
		this.initLayers(api, conf);
		console.log('...fallingBlocks initialized');
		api.startGame();
	}
 
	this.gameData = {
		state: {
			active: true,
			gameOver: false,
			pauseMenu: undefined,
			keysPressed: [],
			all: [],
			locked: [],
			complete: [],
			completeCount: 0,
			curr: undefined,
			next: undefined,
			lines: 0,
			score: 0,
		},
		conf: {
			cols: 14,
			rows: 20,
			blockSize: 33,
			headerSize: 70,
			buttonSize: 60,
			frameBorder: 5,
			timer: 40,
			completeTimer: 25,
			lockedTimer: 15,
			completeColor: 'gainsboro',
			gameOverColor: 'darkred',
			gameColor: 'black',
			lockedColor: 'white',
			headerColor: 'midnightblue',
			headerFont: '16px sans-serif',
			controlFont: '32px arial, sans-serif',
			textColor: 'white',
			blockDarkShade: 'rgba(0,0,0,0.1)',
			blockLightShade: 'rgba(255,255,255,0.1)',
			htmlControlSection: undefined,
			pauseButton: undefined,
			/*
			 * Could use directly copy/pasted symbols...
			 * ... instead use unicode hex values
			 * ... ⏸ '\u23F8', ⏵︎ '\u23F5', ⏯ '\u23EF'
			 * ... ⇦ '\u21E6',
			 * ... ⇧ '\u21E7', ⇪ '\u21EA', ⤾ '\u293E', ↻ '\u21BB', ⟳ '\u27F3', ↩ '\u21A9'
			 * ... ⇨ '\u21E8'
			 * ... ⇩ '\u21E9'
			 * Shout out to Anne @aniel928 for helping with the "emoji" issue in some browsers
			 * ... append '\uFE0E' to hint VS15 version instead of letting the browser guess
			 */
			pauseText: '\u23F8\uFE0E',
			restartText: '\u23F5\uFE0E',
			moveLeftText: '\u21E6\uFE0E',
			rotateText: '\u21E7\uFE0E',
			moveRightText: '\u21E8\uFE0E',
			fallFastText: '\u21E9\uFE0E',
			isTouchDevice: false,
			userAgent: 'UNKNOWN',
			keys: {
				keyEnter: 13,
				keyEsc: 27,
				keySpace: 32,
				keyLeft: 37,
				keyUp: 38,
				keyRight: 39,
				keyDown: 40,
				keyI: 73,
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
		},
	}

	/* 
	 * Simple example of game control init with some typical arrow key codes
	 */
	this.initControls = (api, conf) => {
		// setup handling for key presses by numeric value in array format
		// ...set keys to monitor by passing array of keyCodes (numbers)
		console.log("Setup keyboard controls for keys = " + JSON.stringify(Object.values(conf.keys)));
		api.keys(Object.values(conf.keys));
		// ...and a callback function that will fire every cycle for new input
		api.inputCallback(this.handleKeypress);
		console.log("Setup keyboard controls for game canvas engine = " + JSON.stringify(api.config().input.keys));
		// determine if this should default to touch type input
		conf.userAgent = navigator.userAgent;
		conf.isTouchDevice = this.isTouchUserAgent(conf);
		// ...add buttons to html control section for anyone with a touch screen
		conf.htmlControlSection = document.getElementById('html_control_section');
		if (conf.htmlControlSection) {
			const buttonTable = this.addControlButtonTable(conf, conf.htmlControlSection);
			conf.pauseButton = this.addControlButton(conf, buttonTable, conf.pauseText, conf.keys.keyEnter, 'darkred', 'white');
			this.addControlButton(conf, buttonTable, conf.moveLeftText, conf.keys.keyLeft, 'darkblue', 'white');
			this.addControlButton(conf, buttonTable, conf.rotateText, conf.keys.keySpace, 'darkgreen', 'white');
			this.addControlButton(conf, buttonTable, conf.moveRightText, conf.keys.keyRight, 'darkblue', 'white');
			this.addControlButton(conf, buttonTable, conf.fallFastText, conf.keys.keyDown, 'darkred', 'white');
			this.addControlCheckbox(conf, conf.htmlControlSection, 'Touchscreen?', conf.keys.keyI, 'black');
		}
	}

	this.addControlButtonTable = (conf, parentDiv) => {
		const buttonTable = document.createElement('div');
		const fullWidth = conf.cols * conf.blockSize + conf.frameBorder * 2;
		buttonTable.style.width = '' + fullWidth + 'px';
		buttonTable.style.textAlign = 'center';
		buttonTable.style.display = 'table';
		parentDiv.appendChild(buttonTable);
		return buttonTable;
	}

	this.addControlButton = (conf, parentDiv, name, key, color, textColor, font) => {
		const button = document.createElement('div');
		button.innerHTML = name;
		button.style.height = '' + conf.buttonSize + 'px';
		button.style.width = '' + conf.buttonSize + 'px';
		button.style.display = 'table-cell';
		button.style.textAlign = 'center';
		button.style.verticalAlign = 'middle';
		button.style.font = conf.controlFont;
		button.style.color = textColor;
		button.style.background = color;
		// add event listeners for both touch and click
		button.addEventListener('touchend', (event) => this.handleTouch(event, conf, name, key));
		button.addEventListener('click', (event) => this.handleClick(event, conf, name, key));
		parentDiv.appendChild(button);
		console.log("Setup touch controls for " + name);
		return button;
	}

	this.addControlCheckbox = (conf, parentDiv, name, key, textColor) => {
		const checkboxId = 'checkbox_' + Date.now();
		console.log("Setup controls for checkbox id=" + checkboxId);
		// create checkbox input
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.name = name;
		checkbox.id = checkboxId;
		// auto-select checkbox when touch device
		checkbox.checked = conf.isTouchDevice;
		checkbox.addEventListener('change', (event) => this.handleTouchCheckbox(event, conf, key));
		// create label
		const checkboxLabel = document.createElement('label');
		checkboxLabel.htmlFor = checkboxId;
		checkboxLabel.appendChild(document.createTextNode(name));
		// add both
		parentDiv.appendChild(document.createElement('br'));
		parentDiv.appendChild(checkboxLabel);
		parentDiv.appendChild(checkbox);
		console.log("Setup controls for checkbox name=" + name);
		return checkbox;
	}

	this.isTouchUserAgent = (conf) => {
		let agent = conf.userAgent || 'UNKNOWN';
		console.log("DEBUG: navigator userAgent=", agent);
		if (agent && agent.includes('Android')) {
			agent = 'Android';
		} else if (agent && agent.includes('iPhone')) {
			agent = 'iPhone';
		} else if (agent && agent.includes('iPad')) {
			agent = 'iPad';
		}
		conf.userAgent = agent;
		console.log("DEBUG: parsed userAgent=", agent);
		const isTouchAgent = agent === 'iPhone' || agent === 'iPad' || agent === 'Android';
		return isTouchAgent;
	}

	this.handleTouchCheckbox = (event, conf, key) => {
		if (event.target && event.target.checked) {
			console.log('setting isTouchDevice true');
			conf.isTouchDevice = true;
		} else {
			console.log('setting isTouchDevice false');
			conf.isTouchDevice = false;
		}
		event.preventDefault();
	}

	this.handleClick = (event, conf, name, key) => {
		if (conf.isTouchDevice) {
			console.log('IGNORING ' + name + ' click!');
		} else {
			console.log(name + ' click!');
			this.handleKeypress([key]);
			event.preventDefault();
		}
	}

	this.handleTouch = (event, conf, name, key) => {
		if (conf.isTouchDevice) {
			console.log(name + ' touch!');
			this.handleKeypress([key]);
			event.preventDefault();
		} else {
			console.log('IGNORING ' + name + ' touch!');
		}
	}

	/* 
	 * Simple example of game layer init on to the otherwise empty canvas
	 */
	this.initLayers = (api, conf) => {
		// override the canvas config if desired
		// ...width/height changes take effect once upon startGame()
		const width = api.config().canvas.width = conf.cols * conf.blockSize + 2 * conf.frameBorder;
		const height = api.config().canvas.height = conf.rows * conf.blockSize + conf.headerSize + 2 * conf.frameBorder;
		console.log("Width/Height for game canvas engine = " + width + ":" + height);
		// add minimal config to let this code think and render itself
		const layer = {
			think: this.thinkLayer,
			render: this.renderLayer,
			data: this.gameData
		};
		api.addLayer(layer);
		console.log("Added object to html game canvas engine");
	}

	/*
	 * Reset all data and gameOver flag
	 */
	this.resetGameOver = (state) => {
		state.gameOver = false;
		state.lines = 0;
		state.score = 0;
		state.curr = undefined;
		state.next = undefined;
		state.all = [];
		state.locked = [];
		state.complete = [];
		state.completeCount = 0;
	}

	this.openPauseMenu = (conf, state, message) => {
		state.pauseMenu = {
			text: message
		};
		if (conf.pauseButton) {
			// flip the button control to indicate restart function
			conf.pauseButton.innerHTML = conf.restartText;
		}
	}

	this.closePauseMenu = (conf, state) => {
		state.pauseMenu = undefined;
		if (conf.pauseButton) {
			// flip the button control to indicate pause function
			conf.pauseButton.innerHTML = conf.pauseText;
		}
	}

	/*
	 * Handle inputCallback to start/stop, or push to keysPressed for think time handling
	 */
	this.handleKeypress = (keys) => {
		const api = this.gameApi;
		const state = this.gameData.state;
		const conf = this.gameData.conf;
		const keypress = keys.at(0) || -1;
		if (keypress === conf.keys.keyEsc) {
			// stop
			this.handleStartStop(api, conf, state, true);
		} else if (keypress === conf.keys.keyEnter) {
			// toggle active
			this.handleStartStop(api, conf, state, state.active);
		} else {
			state.keysPressed.push(keypress);
		}
	}

	/*
	 * This will either stop or start the game, resetting gameOver when restarting
	 */
	this.handleStartStop = (api, conf, state, stop) => {
		// start or pause
		if (stop) {
			const pauseText = state.gameOver ? 'G A M E   O V E R' : 'P A U S E D';
			this.openPauseMenu(conf, state, pauseText);
		} else {
			this.closePauseMenu(conf, state);
			if (state.gameOver) {
				this.resetGameOver(state);
			}
			state.active = true;
			api.startGame();
		}
	}

	/*
	 * Helper to handle directional movement of current block
	 */
	this.handleKeypressMovement = (conf, state, keypress) => {
		//console.log("Handling keypress: " + keypress);
		if (state && state.curr) {
			if (keypress === conf.keys.keyUp || keypress == conf.keys.keySpace) {
				const nextOrientation = state.curr.orientation + 1 % 4;
				if (this.checkShapeBounds(conf, { ...state.curr, orientation: nextOrientation}, state.all)) {
					console.log('keypress: CANNOT move left, another block or boundary in the way');
				} else {
					state.curr.orientation = nextOrientation;
				}
			} else if (keypress === conf.keys.keyDown) {
				state.curr.timer = 0;
			} else if (keypress === conf.keys.keyLeft) {
				const nextPx = state.curr.px - 1;
				if (this.checkShapeBounds(conf, { ...state.curr, px: nextPx}, state.all)) {
					console.log('keypress: CANNOT move left, another block or boundary in the way');
				} else {
					state.curr.px = nextPx;
				}
			} else if (keypress === conf.keys.keyRight) {
				const nextPx = state.curr.px + 1;
				if (this.checkShapeBounds(conf, { ...state.curr, px: nextPx}, state.all)) {
					console.log('keypress: CANNOT move right, another block or boundary in the way');
				} else {
					state.curr.px = nextPx;
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
		const api = this.gameApi;
		const state = data.state;
		const conf = data.conf;
		// handle pause, and stop game engine when gameover
		if (state.pauseMenu) {
			// stop game cycle
			state.active = false;
			api.stopGame();
			return;
		} else if (state.gameOver) {
			// begin the stopping process
			this.handleStartStop(api, conf, state, true);
			return;
		}
		// check pending keypress, handle all, then clear
		if (state.keysPressed.length > 0) {
			state.keysPressed.forEach(k => this.handleKeypressMovement(conf, state, k));
			state.keysPressed = [];
		}
		// check for complete rows for removal and shift down on counter
		this.handleCompleteLines(state);
		// check for complete rows for removal and shift down on counter
		this.handleLockedBlocks(state);
		// when we don't have curr data, add new one randomly
		if (!state.next) {
			state.next = this.newBlock(api, conf);
		}
		if (!state.curr) {
			state.curr = state.next;
			state.next = undefined;
		}
		// decrement curr timer and see if its ready to auto-fall...
		if (state.curr.timer-- <= 0) {
			this.handleAutoFallTimer(conf, state);
		}
	}

	/*
	 * This will handle checking if the auto-fall would cause a collision.
	 * Then either let the shape fall by one position, or lock it in to pre-fall position and create new.
	 */
	this.handleAutoFallTimer = (conf, state) => {
		const nextPy = state.curr.py + 1;
		// check fall position for collisions
		if (this.checkShapeBounds(conf, { ...state.curr, py: nextPy}, state.all) === false) {
			// auto-fall
			state.curr.py = nextPy;
			state.curr.timer = conf.timer;
		} else {
			// auto-fall would violate bounds, lock at current position
			const { px, py } = this.startingPosition(conf);
			// check to see if we're still at starting position, which is game over
			if (px === state.curr.px && py === state.curr.py) {
				// TODO: what if locking this shape in starting position clears a line or more? game should continue?
				console.log('locked in starting startingPosition, game over');
				state.gameOver = true;
			} else {
				this.lockShape(conf, state);
				state.curr = state.next;
				state.next = undefined;
			}
		}
	}

	/*
	 * This will handle animating the removal of rows marked for removal
	 */
	this.handleCompleteLines = (state) => {
		// if completeCount zero or less, nothing to do
		if (state.completeCount > 0) {
			// decrement until zero, then remove all rows pending removal and shift other blocks down
			state.completeCount--;
			if (state.completeCount <= 0 && state.complete.length > 0) {
				state.complete.forEach(py => this.handleCompleteRow(state, py));
				state.complete = [];
			}
		}
	}

	/*
	 * This will handle removing a single row at py, and shifting down locked blocks above (less than) py
	 */
	this.handleCompleteRow = (state, py) => {
		console.log('removing row py =', py);
		// filter out any blocks in py row...
		state.all = state.all.filter(block => block.py !== py).map(block => {
			// ...and shift down (add to py) and rows with a py < row py
			if (block.py < py) {
				block.py = block.py + 1;
			}
			return block;
		});
	}

	/*
	 * This will handle identifying any rows that are "complete" and ready to mark for removal
	 */
	this.checkCompleteLines = (conf, state) => {
		let completeLines = 0;
		// check each y row for complete, starting at the top, since rows above need to fall
		for (py = 0; py < conf.rows; py++) {
			// if complete, mark for removal
			if (this.checkCompleteRow(conf, state, py)) {
				console.log('mark complete for py =', py);
				this.markCompleteRow(conf, state, py);
				completeLines++;
			}
		};
		if (completeLines > 0) {
			state.lines += completeLines;
			// 250 points per line
			state.score += completeLines * 250;
			// plus bonus for 3 or 4
			if (completeLines > 3) {
				state.score += 4000;
			} else if (completeLines > 2) {
				state.score += 1250;
			}
		}
	}

	/*
	 * This will handle identifying if the row at py is "complete"
	 */
	this.checkCompleteRow = (conf, state, py) => {
		// filter/reduce down to every px with a matching py
		const pxs = state.all.filter(block => block.py === py).map(block => block.px);
		// then make sure the list of pxs includes every column
		for (px = 0; px < conf.cols; px++) {
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
	this.markCompleteRow = (conf, state, py) => {
		// set removal color on every block with a matching py
		state.all.filter(block => block.py === py).forEach(block => {
			block.color = conf.completeColor;
		});
		// and add py to complete data, resetting removal timer
		state.complete.push(py);
		state.completeCount = conf.completeTimer;
	}

	/*
	 * This will handle animating the latest locked shape
	 */
	this.handleLockedBlocks = (state) => {
		if (state.locked.length > 0) {
			// decrement each timer
			state.locked.forEach(b => b.timer--);
			// if zero or less, remove from locked data
			state.locked = state.locked.filter(b => b.timer > 0);
		}
	}

	/*
	 * This will return true when any block within the current shape is overlapping another block or boundary
	 */
	this.checkShapeBounds = (conf, block, all) => {
		const shape = conf.shapes[`${block.shape}`];
		const xys = shape[block.orientation % shape.length];
		const color = block.color;
		let shapeBounds = false;
		for (skip = 0; skip < 8 && !shapeBounds; skip += 2) {
			let px = block.px + xys[0 + skip];
			let py = block.py + xys[1 + skip];
			shapeBounds = checkBounds(conf, px, py, all);
		}
		return shapeBounds;
	}

	/*
	 * This will return true when x,y is overlapping another block or boundary
	 */
	this.checkBounds = (conf, px, py, all) => {
		// check x,y against bounds of board
		if (
			py >= conf.rows ||
			px < 0 ||
			px >= conf.cols
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
	this.lockShape = (conf, state) => {
		// each piece of the shape gets its own block
		const shape = conf.shapes[`${state.curr.shape}`];
		const xys = shape[state.curr.orientation % shape.length];
		// grab in pairs, jump by 2 each loop
		for (skip = 0; skip < 8; skip += 2) {
			let px = state.curr.px + xys[0 + skip];
			let py = state.curr.py + xys[1 + skip];
			state.all.push({px, py, color: state.curr.color});
			// also add to locked data with a count to decrement so it can be highlighted briefly
			state.locked.push({px, py, color: conf.lockedColor, timer: conf.lockedTimer})
		}
		// bump score for each locked shape
		state.score += 5;
		// then check for new complete rows
		this.checkCompleteLines(conf, state);
	}

	this.newColor = (api, conf) => {
		return conf.colors[api.random(conf.colors.length)];
	}

	this.newShape = (api, conf) => {
		// small even number modulus from RNG are not well spread
		// ...use a larger random max then modulus again
		const shapes = Object.keys(conf.shapes);
		const shapeIdx = api.random(123456789) % shapes.length;
		const shape = shapes[shapeIdx];
		return shape;
	}

	this.startingPosition = (conf) => {
		return { 
			px: conf.cols/2 - 1, 
			py: 0
		}; 
	}

	this.newBlock = (api, conf) => {
		const { px, py } = this.startingPosition(conf);
		const color = this.newColor(api, conf);
		const shape = this.newShape(api, conf);
		const orientation = 0;
		return {
			px,
			py,
			color,
			shape,
			orientation,
			timer: conf.timer
		};
	}

	this.renderShape = (api, conf, block, blockSize) => {
		const shape = conf.shapes[`${block.shape}`];
		const xys = shape[block.orientation % shape.length];
		const color = block.color;
		for (skip = 0; skip < 8; skip += 2) {
			let px = block.px + xys[0 + skip];
			let py = block.py + xys[1 + skip];
			this.renderBlock(api, conf, {color, px, py}, blockSize)
		}
	}

	this.renderBlock = (api, conf, block, blockSize) => {
		const bx = block.px * blockSize + conf.frameBorder;
		const by = block.py * blockSize + conf.headerSize + conf.frameBorder;
		const corners = [
			{ x: bx, y: by },
			{ x: bx + blockSize, y: by },
			{ x: bx + blockSize, y: by + blockSize },
			{ x: bx, y: by + blockSize },
		];
		// draw block color
		api.drawUtil({ 
			type: 'path', 
			c: block.color,
			path: corners
		});
		// then light triangle shading on top
		api.drawUtil({ 
			type: 'path', 
			c: conf.blockLightShade,
			path: [ corners[3], corners[0], corners[1] ],
		});
		// then dark triangle shading on bottom
		api.drawUtil({ 
			type: 'path', 
			c: conf.blockDarkShade,
			path: [ corners[1], corners[2], corners[3] ],
		});
	}

	this.renderHeader = (api, conf, state, color) => {
		// draw a different color background
		api.drawUtil({ 
			type: 'rect', 
			c: color,
			x: 0, 
			y: 0, 
			dx: conf.cols * conf.blockSize + 2 * conf.frameBorder, 
			dy: conf.headerSize + conf.frameBorder
		});
		// score details
		api.drawUtil({
			type: 'text',
			x: 10,
			y: conf.headerSize * 0.45,
			c: conf.textColor,
			font: conf.headerFont,
			text: 'Score: ' + state.score
		});
		api.drawUtil({
			type: 'text',
			x: 10,
			y: conf.headerSize * 0.9,
			c: conf.textColor,
			font: conf.headerFont,
			text: 'Lines: ' + state.lines
		});
		if (state.pauseMenu) {
			api.drawUtil({
				type: 'text',
				x: conf.cols * conf.blockSize * 0.7,
				y: conf.headerSize * 0.9,
				c: conf.textColor,
				font: conf.headerFont,
				text: state.pauseMenu.text
			});
		} else if (state.next) {
			const nextShape = {
				...state.next,
				orientation: 1, 
				px: conf.cols - 2,
				py: -2
			};
			this.renderShape(api, conf, nextShape, conf.blockSize);
			api.drawUtil({
				type: 'text',
				x: conf.cols * conf.blockSize * 0.7,
				y: conf.headerSize * 0.9,
				c: conf.textColor,
				font: conf.headerFont,
				text: 'Next:'
			});
		}
	}

	this.renderBackground = (api, conf, state) => {
		// draw a different color background
		api.drawUtil({ 
			type: 'rect', 
			c: state.gameOver ? conf.gameOverColor : conf.gameColor,
			x: 0, 
			y: 0, 
			dx: conf.cols * conf.blockSize + 2 * conf.frameBorder, 
			dy: conf.rows * conf.blockSize + conf.headerSize + 2 * conf.frameBorder
		});
	}

	/*
	 * Render each cycle
	 */
	this.renderLayer = (idx, count, data, ctx) => {
		const api = this.gameApi;
		const state = data.state;
		const conf = data.conf;
		this.renderBackground(api, conf, state);
		this.renderHeader(api, conf, state, conf.headerColor);
		state.all.forEach(d => this.renderBlock(api, conf, d, conf.blockSize));
		state.locked.forEach(d => this.renderBlock(api, conf, d, conf.blockSize));
		if (state.curr) {
			this.renderShape(api, conf, state.curr, conf.blockSize);
		}
	}

})();
