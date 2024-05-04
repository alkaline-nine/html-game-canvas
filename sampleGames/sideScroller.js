"use strict";
/*
 *  Sample game using the game engine
 */
(function () {
	console.log('Loading window.sideScroller...');
	window.sideScroller = new SideScrollerGame();

	class SideScrollerGame {
		// define everything in the constructor
		constructor() {

			/* 
			 * The gameApi is required to run this sample game
			 */
			this.gameApi = undefined;
			this.init = (api) => {
				const conf = this.sideScrollerData.conf;
				const state = this.sideScrollerData.state;
				// attach the gameApi
				this.gameApi = api;
				// add custom keyboard (and touch/click) controls
				this.initControls(api, conf);
				// add custom layer data
				this.initLayers(api, conf);
				// add random data to our renderable layers
				state.layers = this.generateLayers(api, conf, state);
				state.playerData = this.generatePlayerData(api, conf, state);
				console.log('...sideScroller initialized');
				api.startGame();
			}

			this.gameName = () => 'sideScroller';

			this.sideScrollerData = {
				state: {
					active: true,
					score: 0,
					gameOver: false,
					pauseMenu: undefined,
					posX: 0,
					posY: 0,
					momentumX: 0,
					momentumY: 0,
					keysPressed: [],
					layerData: [],
					playerData: undefined,
				},
				conf: {
					width: 720,
					height: 480,
					stepMomentum: 8, // moving left or right, this many pixels per cycle
					stepFastMod: 30, // sprinting left or right, bumped to this many pixels, but decreased per cycle
					jumpMomentum: 40, // total cycles start to finish for a single jump
					jumpFastRise: 31, // countdown to this will rise fast
					jumpTop: 22, // countdown to this will rise slow
					jumpStep: 8, // average rise amount per cycle
					jumpFastMod: 2.0, // amount to increase rise from average
					jumpSlowMod: 0.2, // amount to decrease rise from average
					playerRadius: 50, // outer eyeball average radius
					playerInnerRadius: 38, // inner eyeball average radius
					playerInnerEyeRadius: 21, // inner eyeball average radius
					playerPulse: 5, // pixels to fluctuate from
					rollFactor: 1.25, // this divides 360 degrees to calc roll vector compared to horizontal movement in pixes
					htmlControlSection: undefined,
					pauseButton: undefined,
					headerSize: 70,
					frameBorder: 2,
					buttonSize: 80,
					playerColor: 'lightgrey', // outer eyeball color
					playerInnerColors: [
						'#4444BB', '#a11818', '#634e34', '#2e536f', '#3d671d', '#1c7847', '#497665'
					],
					playerInnerEyeColor: 'black', // inner eyeball retina color
					completeColor: 'gainsboro',
					gameOverColor: 'darkred',
					gameColor: 'black',
					lockedColor: 'white',
					headerColor: 'midnightblue',
					headerFont: '16px sans-serif',
					controlFont: '32px arial, sans-serif',
					textColor: 'white',
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
					layers: [
						{
							total: 80,
							scale: 0.02,
							sizeX: 1,
							sizeY: 1,
							bgColor: 'midnightblue',
							objColor: 'white',
							objType: 'star',
						},
						{
							total: 40,
							scale: 0.01,
							sizeX: 2,
							sizeY: 3,
							bgColor: undefined,
							objColor: 'white',
							objType: 'star',
						},
						{
							total: 20,
							scale: 0.03,
							sizeX: 3,
							sizeY: 4,
							bgColor: undefined,
							objColor: 'white',
							objType: 'star',
						},
						{
							total: 30,
							scale: 0.3,
							sizeX: 200,
							sizeY: 200,
							bgColor: undefined,
							objColor: 'random',
							objType: 'mountain',
						},
						{
							total: 25,
							scale: 0.45,
							sizeX: 200,
							sizeY: 130,
							bgColor: undefined,
							objColor: 'random',
							objType: 'mountain',
						},
						{
							total: 20,
							scale: 0.75,
							sizeX: 30,
							sizeY: 100,
							bgColor: undefined,
							objColor: 'darkgreen',
							objType: 'tree',
						},
						{
							total: 40,
							scale: 0.95,
							sizeX: 15,
							sizeY: 60,
							bgColor: undefined,
							objColor: 'green',
							objType: 'tree',
						},
						{
							total: 6,
							scale: 1.2,
							sizeX: 60,
							sizeY: 2,
							bgColor: 'black',
							bgPosY: 450,
							bgSizeY: 30 + 4, /* 2*frameBorder=4 */
							objColor: 'white',
							objType: 'road',
						},
					],
				},
			}

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
					conf.htmlControlSection.innerHTML = '';
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

			this.addControlButton = (conf, parentDiv, name, key, color, textColor) => {
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

			this.initLayers = (api, conf) => {
				// override the canvas config if desired
				// ...width/height changes take effect once upon startGame()
				const width = api.config().canvas.width = conf.width + 2 * conf.frameBorder;
				const height = api.config().canvas.height = conf.height + conf.headerSize + 2 * conf.frameBorder;
				console.log("Width/Height for game canvas engine = " + width + ":" + height);
				// add minimal config to let this code think and render itself
				const layer = {
					think: this.thinkLayer,
					render: this.renderLayer,
					data: this.sideScrollerData,
				};
				api.addLayer(layer);
				console.log("Added object to html game canvas engine");
			}

			this.generatePlayerData = (api, conf, state, layerConf) => {
				return {
					rotation: 0,
					pulse: 0,
					radius: conf.playerRadius,
					innerRadius: conf.playerInnerRadius,
					innerEyeRadius: conf.playerInnerEyeRadius,
					color: conf.playerColor,
					innerColor: this.randomEyeColor(api, conf),
					innerEyeColor: conf.playerInnerEyeColor,
					momentumX: 0,
					momentumY: 0,
					offsetX: 0,
					offsetY: 0,
				};
			}

			/*
			 * Randomly generate multi-layer data for render
			 */
			this.generateLayers = (api, conf, state) => {
				return conf.layers.map(layerConf => this.generateLayer(api, conf, state, layerConf));
			}

			this.generateLayer = (api, conf, state, layerConf) => {
				const objs = this.generateObjects(api, conf, layerConf);
				console.log('Generated ' + objs.length + ' objects for layer=', layerConf);
				return {
					objs,
					scale: layerConf.scale,
					sizeX: layerConf.sizeX,
					sizeY: layerConf.sizeY,
					bgColor: layerConf.bgColor,
					bgPosX: layerConf.bgPosX,
					bgPosY: layerConf.bgPosY,
					bgSizeX: layerConf.bgSizeX,
					bgSizeY: layerConf.bgSizeY,
					count: 0,
				};
			}

			this.getObjPosition = (api, conf, layerConf, idx) => {
				let x = api.random(99999999) % conf.width;
				let y = api.random(77777777) % conf.height;
				if (layerConf.objType === 'star') {
					// y should be top 2/3
					y = y % (2 * conf.height / 3.0);
				} else if (layerConf.objType === 'mountain') {
					// y should be bottom 4/5
					// y = y % (4 * conf.height / 5.0) + conf.height / 5.0;
					// use layerConf y value
					y = conf.height - api.random(2 * layerConf.sizeY);
				} else if (layerConf.objType === 'tree') {
					// y should be bottom 1/3
					// y = y % (conf.height / 3.0) + 2.0 * conf.height / 3.0;
					// use layerConf y value
					y = conf.height - api.random(2 * layerConf.sizeY);
				} else if (layerConf.objType === 'road') {
					// y should be bottom 1/10 of screen
					// y = 9.0 * conf.height / 10.0;
					// lock these in an order by index
					x = (2 * layerConf.sizeX) * idx;
					y = conf.height - 20;
				}
				console.log('getObjPosition type=' + layerConf.objType + ', x,y=', x, y);
				return { x, y };
			}

			this.generateObjects = (api, conf, layerConf) => {
				console.log('Generate objects for layer=', layerConf);
				const objs = [];
				for (let i = 0; i < layerConf.total; i++) {
					// get x, y based on type
					const { x, y } = this.getObjPosition(api, conf, layerConf, i);
					// possibly random color
					const objColor = layerConf.objColor === 'random' ? this.generateColor(api) : layerConf.objColor;
					// create renderable obj
					const obj = {
						objType: layerConf.objType,
						objColor,
						x,
						y,
					};
					console.log('Generate obj=', obj);
					objs.push(obj);
				}
				return objs;
			}

			this.randomEyeColor = (api, conf) => {
				return conf.playerInnerColors[api.random(777777) % conf.playerInnerColors.length];
			}

			this.generateColor = (api) => {
				const r = this.hexColor(api.random(777777777));
				const g = this.hexColor(api.random(777777777));
				const b = this.hexColor(api.random(777777777));
				const colorCode = `#${r}${g}${b}`;
				console.log('random color code=' + colorCode);
				return colorCode;
			}

			this.hexColor = (num) => {
				num = num % 256;
				const idx0 = Math.floor(num / 16);
				const idx1 = num % 16;
				console.log('num=' + num + ' idx 0/1=' + idx0 + ' ' + idx1);
				const hexs = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
				return `${hexs[idx0]}${hexs[idx1]}`;
			}

			/*
			 * Reset all data and gameOver flag
			 */
			this.resetGameOver = (api, conf, state) => {
				state.layers = this.generateLayers(api, conf, state);
				state.playerData = this.generatePlayerData(api, conf, state);
				state.posX = 0;
				state.posY = 0;
				state.gameOver = false;
				state.score = 0;
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
				const state = this.sideScrollerData.state;
				const conf = this.sideScrollerData.conf;
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
						this.resetGameOver(api, conf, state);
					}
					state.active = true;
					api.startGame();
				}
			}

			/*
			 * Helper to handle directional movement of current block
			 */
			this.handleKeypressMovement = (conf, state, keypress) => {
				console.log('Handling keypress: ' + keypress);
				if (state && state.active) {
					if (keypress === conf.keys.keyUp || keypress == conf.keys.keySpace) {
						// JUMP!
						state.playerData.momentumY = conf.jumpMomentum;
					} else if (keypress === conf.keys.keyDown) {
						// STOP moving horizontal
						state.playerData.momentumX = 0;
					} else if (keypress === conf.keys.keyLeft) {
						if (state.playerData.momentumX <= conf.stepMomentum * -1) {
							// SPRINT LEFT
							state.playerData.momentumX = conf.stepFastMod * -1;
						} else {
							// START moving LEFT
							state.playerData.momentumX = conf.stepMomentum * -1;
						}
					} else if (keypress === conf.keys.keyRight) {
						if (state.playerData.momentumX >= conf.stepMomentum) {
							// SPRINT RIGHT
							state.playerData.momentumX = conf.stepFastMod;
						} else {
							// START moving RIGHT
							state.playerData.momentumX = conf.stepMomentum;
						}
					} else {
						console.log('keypress: UNKNOWN ', keypress);
					}
					console.log('state x=' + state.posX + ' y=' + state.posY);
					console.log('state momX=' + state.playerData.momentumX + ' momY=' + state.playerData.momentumY);
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
				// ...think for player
				// if no movement, nothing changes
				const { moveX, moveY } = this.thinkPlayerMovement(conf, state, state.playerData);
				if (moveX !== 0 || moveY !== 0) {
					// update position based on movement, and do additional player thinking
					state.posX += moveX;
					state.posY += moveY;
				}
				state.playerData = this.thinkPlayerData(conf, state, state.playerData, count);
				// for each scaled layer...
				// ...think
				state.layers.forEach(layer => this.layerUpdate(layer, conf, state, count));
				// ...filter layers ready for removal
				state.layers = state.layers.filter(layer => !this.layerRemoval(layer, conf));
			}

			this.thinkPlayerMovement = (conf, state, data) => {
				// check horizontal movement
				let moveX = 0;
				if (data.momentumX !== 0) {
					// move forwards or backwards with momentum value
					moveX = data.momentumX;
					// check if we need to decrease from sprinting speed
					if (data.momentumX < conf.stepMomentum * -1) {
						data.momentumX++;
					} else if (data.momentumX > conf.stepMomentum) {
						data.momentumX--;
					}
				}
				// check vertical movement
				let moveY = 0;
				if (data.momentumY > 0) {
					data.momentumY--;
					const distanceToGround = 0 - state.posY;
					console.log('momentumY=', data.momentumY, 'distanceToGround=', distanceToGround);
					// ...use a linear up/down based on 3 phases: up fast, up slow, down fast
					if (data.momentumY === 0) {
						// we landed on ground!
						moveY = distanceToGround;
						console.log('landed!');
					} else if (data.momentumY > conf.jumpFastRise) {
						// continue to move up
						moveY = conf.jumpStep * -1 * conf.jumpFastMod;
						console.log('rising fast!');
					} else if (data.momentumY > conf.jumpTop) {
						// continue to move up
						moveY = conf.jumpStep * -1 * conf.jumpSlowMod;
						console.log('rising!');
					} else {
						// keep falling towards ground as percentage of remaining distance
						const thisDistance = distanceToGround / data.momentumY 
						moveY = Math.floor(thisDistance);
						console.log('falling! thisDistance=', thisDistance);
					}
				}
				// console.log('move x/y =', moveX, moveY);
				return { moveX, moveY };
			}

			this.thinkPlayerData = (conf, state, data, count) => {
				const newData = { ...data };
				// ...pulse based on count
				const pulse = Math.abs(conf.playerPulse * Math.sin(count/13));
				newData.pulse = pulse;
				// ...handle rotation based on movement
				const rotateRange = Math.floor(360 / conf.rollFactor);
				const rotation = Math.floor((rotateRange - (state.posX % rotateRange)) * conf.rollFactor);
				if (rotation !== newData.rotation) {
					newData.rotation = rotation;
				}
				// ...determine rotation offsets for inner circle
				const { offsetX, offsetY } = this.rotationOffset(newData.radius, newData.innerRadius, rotation);
				if (offsetX !== newData.offsetX || offsetY !== newData.offsetY) {
					newData.offsetX = offsetX;
					newData.offsetY = offsetY;
				}
				return newData;
			}

			this.rotationOffset = (radius, innerRadius, rotation) => {
				const sinX = Math.sin(2 * Math.PI * rotation / 360);
				const cosY = Math.cos(2 * Math.PI * rotation / 360);
				// console.log('sin/cos = ', sinX, cosY);
				const range = radius - innerRadius;
				//const rangeOffset = range * 0.5;
				//const baseOffset = 0.5 * range + 0.5 * innerRadius;
				const offsetX = range + sinX * range;
				const offsetY = range + cosY * range;
				// console.log('offset = ', offsetX, offsetY);
				return {
					offsetX,
					offsetY,
				}
			}

			/*
			 * Basic think per layer to bump count
			 */
			this.layerUpdate = (layer, conf, state, count) => {
				layer.count = count;
			}

			/*
			 * Check if this layer has a removeAtCount and return true when we reach that count
			 */
			this.layerRemoval = (layer, conf) => {
				if (layer.removeAtCount && layer.removeAtCount <= layer.count)
					return true;
				return false;
			}

			this.renderHeader = (api, conf, state, color) => {
				// draw a different color background
				api.drawUtil({ 
					type: 'rect', 
					c: color,
					x: 0, 
					y: 0, 
					dx: conf.width + 2 * conf.frameBorder, 
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
				if (state.pauseMenu) {
					api.drawUtil({
						type: 'text',
						x: conf.width * 0.7,
						y: conf.headerSize * 0.9,
						c: conf.textColor,
						font: conf.headerFont,
						text: state.pauseMenu.text
					});
				}
				// draw a line at bottom of header
				api.drawUtil({ 
					type: 'rect', 
					c: 'white',
					x: 0, 
					y: conf.headerSize, 
					dx: conf.width + 2 * conf.frameBorder, 
					dy: conf.frameBorder
				});
			}

			this.renderBackground = (api, conf, state) => {
				// draw a different color background
				api.drawUtil({ 
					type: 'rect', 
					c: state.gameOver ? conf.gameOverColor : conf.gameColor,
					x: 0, 
					y: 0, 
					dx: conf.width + 2 * conf.frameBorder, 
					dy: conf.height + conf.headerSize + 2 * conf.frameBorder
				});
			}

			this.renderStar = (api, x, y, scale, sizeX, sizeY, color) => {
				const path = [
					{x: x - sizeX, y: y},
					{x: x - sizeX/3, y: y - sizeY/3},
					{x: x, y: y - sizeY},
					{x: x + sizeX/3, y: y - sizeY/3},
					{x: x + sizeX, y: y},
					{x: x + sizeX/3, y: y + sizeY/3},
					{x: x, y: y + sizeY},
					{x: x - sizeX/3, y: y + sizeY/3},
					{x: x - sizeX, y: y},
				];
				api.drawUtil({ 
					type: 'path', 
					c: color,
					path,
				});
			}

			this.renderRoad = (api, conf, x, y, scale, sizeX, sizeY, color) => {
				const bottomY = conf.headerSize + conf.frameBorder + conf.height;
				api.drawUtil({ 
					type: 'rect', 
					c: color,
					x,
					y,
					dx: sizeX,
					dy: sizeY,
				});
			}

			this.renderTree = (api, conf, x, y, scale, sizeX, sizeY, color) => {
				const bottomY = conf.headerSize + conf.frameBorder + conf.height;
				const my = (bottomY - y) / 2;
				if (my <= 0) return; 
				api.drawUtil({ 
					type: 'ellipse', 
					c: color,
					x,
					y,
					mx: sizeX,
					my,
				});
			}

			this.renderMountain = (api, conf, x, y, scale, sizeX, sizeY, color) => {
				const bottomY = conf.headerSize + conf.frameBorder + conf.height;
				const path = [
					{x: x, y: y},
					{x: x - sizeX, y: bottomY},
					{x: x + sizeX, y: bottomY},
					{x: x, y: y},
				];
				api.drawUtil({ 
					type: 'path', 
					c: color,
					path,
				});
			}

			this.renderLayerObj = (api, conf, state, layer, obj, scaledPosX, scaledPosY) => {
				// determine offset based on state. posX, posY
				// ...x coord will roll/repeat on other side of screen
				let x = obj.x - scaledPosX;
				while (x > conf.width) {
					x -= conf.width;
				}
				while (x < 0) {
					x += conf.width;
				}
				// ...y coord is absolute
				let y = obj.y - scaledPosY;
				// ...check if this x is left or right of center to draw on both sides of screen to prevent disappearing
				let redrawX = x > conf.width / 2 ? x - conf.width : x + conf.width;
				// ...then offset for header/frame
				x += conf.frameBorder;
				redrawX += conf.frameBorder;
				y += conf.headerSize + conf.frameBorder;
				// ...render shape
				switch (obj.objType) {
					case 'star':
						this.renderStar(api, x, y, layer.scale, layer.sizeX, layer.sizeY, obj.objColor);
						this.renderStar(api, redrawX, y, layer.scale, layer.sizeX, layer.sizeY, obj.objColor);
						break;
					case 'tree':
						this.renderTree(api, conf, x, y, layer.scale, layer.sizeX, layer.sizeY, obj.objColor);
						this.renderTree(api, conf, redrawX, y, layer.scale, layer.sizeX, layer.sizeY, obj.objColor);
						break;
					case 'road':
						this.renderRoad(api, conf, x, y, layer.scale, layer.sizeX, layer.sizeY, obj.objColor);
						this.renderRoad(api, conf, redrawX, y, layer.scale, layer.sizeX, layer.sizeY, obj.objColor);
						break;
					case 'mountain':
						this.renderMountain(api, conf, x, y, layer.scale, layer.sizeX, layer.sizeY, obj.objColor);
						this.renderMountain(api, conf, redrawX, y, layer.scale, layer.sizeX, layer.sizeY, obj.objColor);
						break;
					default:
						console.log('Unknown objType=' + obj.objType);
						break;
				}
			}

			this.renderLayerObjs = (api, conf, state, layer) => {
				// if layer has bgColor, render it
				if (layer.bgColor) {
					let x = (layer.bgPosX ? layer.bgPosX : 0);
					let y = conf.headerSize + conf.frameBorder + (layer.bgPosY ? layer.bgPosY - state.posY : 0);
					let dx = (layer.bgSizeX ? layer.bgSizeX : conf.width + conf.frameBorder * 2);
					let dy = (layer.bgSizeY ? layer.bgSizeY : conf.height + conf.frameBorder);
					// console.log('x/y...dx/dy...color=', x, y, dx, dy, layer.bgColor);
					api.drawUtil({ 
						type: 'rect', 
						c: layer.bgColor,
						x: x, 
						y: y, 
						dx: dx, 
						dy: dy,
					});
				}
				// then render each obj
				const scaledPosX = state.posX * layer.scale;
				const scaledPosY = state.posY * layer.scale;
				//console.log('scale pos x,y=' + scaledPosY + ' ' + scaledPosY);
				layer.objs.forEach(obj => this.renderLayerObj(api, conf, state, layer, obj, scaledPosX, scaledPosY));
			}

			this.renderPlayerObj = (api, conf, state, data) => {
				// vertical offset
				const verticalShift = state.posY * -2;
				// draw main circle
				const middleX = conf.width / 2 + conf.frameBorder - data.radius;
				const bottomY = conf.height + conf.headerSize + conf.frameBorder - data.radius * 2 - verticalShift;
				this.gameApi.drawUtil({ 
					type: 'ellipse', 
					c: data.color,
					x: middleX + data.pulse * 0.5, 
					y: bottomY - data.pulse, 
					mx: data.radius - data.pulse * 0.5, 
					my: data.radius + data.pulse * 0.5,
				});
				// draw directional inner circles
				const posInnerX = middleX + data.offsetX;
				const posInnerY = bottomY + data.offsetY;
				this.gameApi.drawUtil({ 
					type: 'ellipse', 
					c: data.innerColor,
					x: posInnerX + data.pulse * 0.25, 
					y: posInnerY + data.pulse * 0.5, 
					mx: data.innerRadius - data.pulse * 0.5, 
					my: data.innerRadius - data.pulse * 0.5,
				});
				const innerEyeMod = data.innerRadius - data.innerEyeRadius;
				const posEyeX = middleX + data.offsetX + innerEyeMod;
				const posEyeY = bottomY + data.offsetY + innerEyeMod;
				this.gameApi.drawUtil({ 
					type: 'ellipse', 
					c: data.innerEyeColor,
					x: posEyeX + data.pulse * 0.25, 
					y: posEyeY + data.pulse * 0.5, 
					mx: data.innerEyeRadius, 
					my: data.innerEyeRadius,
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
				// render layers for current offset
				state.layers.forEach(layer => this.renderLayerObjs(api, conf, state, layer));
				// render self on top of everything else
				this.renderPlayerObj(api, conf, state, state.playerData);
			}
		} // END constructor
	} // END class
	console.log('window.sideScroller.init(gameApi) to run...');
})();
