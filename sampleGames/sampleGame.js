"use strict";
/*
 *  Sample game using the game engine
 */
(function () {
	console.log('Loading window.sampleGame...');
	window.sampleGame = new SampleGame();

	class SampleGame {
		// define everything in the constructor
		constructor() {

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
				console.log('...sampleGame initialized');
			}

			this.gameName = () => 'sampleGame';

			/* 
			 * Some example keys to handle by keyCode
			 */
			this.keyLeft = 37;
			this.keyUp = 38;
			this.keyRight = 39;
			this.keyDown = 40;
			this.keySpace = 32;
			this.keyEnter = 13;
			this.keyEsc = 27;

			/* 
			 * Simple example of game control init with some typical arrow key codes
			 */
			this.initControls = () => {
				// setup handling for key presses by numeric value in array format
				// ...set keys to monitor by passing array of keyCodes (numbers)
				this.gameApi.keys([this.keyUp, this.keyDown, this.keyLeft, this.keyRight]);
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
				const width = this.gameApi.config().canvas.width = 640;
				const height = this.gameApi.config().canvas.height = 640;
				console.log("Width/Height for game canvas engine = " + width + ":" + height);
				// then add a bunch of objects (layers) with data, think(), and render()
				const totalToAdd = 400;
				for (let i=0; i<totalToAdd; i++) {
					// layers need to provide think and render if desierd to be used
					// ...and any data provided will be stored in the layer and provided each cycle
					const layer = {
						think: this.thinkLayer,
						render: this.renderLayer,
						data: { 
							// help track obj when think() or render() is called
							id: i,
							// position x,y of obj for render() cycle
							posX: i,
							posY: i,
							// width/height of obj for render() randomized
							sizeX: this.gameApi.random(50) + 10,
							sizeY: this.gameApi.random(50) + 10,
							// step +/- position x/y for think() cycle
							moveX: ((1 + i) % 7),
							moveY: ((4 + i) % 7),
							// define min/max x/y absolute canvas positions for bounds control
							minX: 0,
							maxX: width,
							minY: 0,
							maxY: height,
							// hold a color for render()
							color: 'blue',
							// ability to auto remove obj from game API based on cycle count
							expires: this.gameApi.random(2100) + 1,
						}
					};
					this.gameApi.addLayer(layer);
					console.log("Adding object to html game canvas engine");
				}
			}

			/*
			 * Simple example of an inputCallback function to handle keys array
			 * @param keys (array of numbers) representing sequential keypresses by keyCode
			 */
			this.handleKeypress = (keys) => {
				// just check first key in list for brevity, but depending on speed, could be multiple
				const keypress = keys.at(0) || -1;
				console.log("Handling keypress: " + keypress);
				if (keypress === this.keyUp) {
					// frame mode
					console.log('keypress: renderCycleType = frame');
					this.gameApi.config().canvas.renderCycleType = 'frame';
				} else if (keypress === this.keyDown) {
					// timer mode
					console.log('keypress: renderCycleType = timer');
					this.gameApi.config().canvas.renderCycleType = 'timer';
				} else if (keypress === this.keyRight) {
					// start if not already
					if (this.gameApi.config().active === false) {
						console.log('keypress: startGame');
						this.gameApi.startGame();
					}
				} else if (keypress === this.keyLeft) {
					// stop if not already
					if (this.gameApi.config().active === true) {
						console.log('keypress: stopGame');
						this.gameApi.stopGame();
					}
				}
				console.log("Handled keypress: " + keypress);
			}

			/* 
			 * Simple example of using the data stored in the game canvas to "think" for each obj each cycle
			 * @param idx (number) in the layer stack, used in removeLayer(idx)
			 * @param count (number) of cycles since last reset via startGame()
			 * @param data (obj) layer.data as added in addLayer(layer)
			 */
			this.thinkLayer = (idx, count, data) => {
				// update X data
				data.posX += data.moveX;
				if (data.posX + data.sizeX >= data.maxX) {
					data.posX = data.maxX - data.sizeX;
					data.moveX *= -1;
					data.color = 'blue';
				} else if (data.posX <= data.minX) {
					data.posX = data.minX;
					data.moveX *= -1;
					data.color = 'green';
				}
				// update Y data
				data.posY += data.moveY;
				if (data.posY + data.sizeY >= data.maxY) {
					data.posY = data.maxY - data.sizeY;
					data.moveY *= -1;
					data.color = 'red';
				} else if (data.posY <= data.minY) {
					data.posY = data.minY;
					data.moveY *= -1;
					data.color = 'white';
				}
				// if this object has reached its expiration, remove it
				if (data.expires > 0 && data.expires < count) {
					//console.log("Auto-remove layer idx=" + idx + " id=" + data.id + " expires=" + data.expires);
					this.gameApi.removeLayer(idx);
				}
				// hard stop after xx cycles for testing
				if (count > 2000) {
					this.gameApi.stopGame();
				}
			}

			/*
			 * Simple example of using the data stored in the game canvas to "render" each obj each cycle
			 * @param idx (number) in the layer stack
			 * @param count (number) of cycles since last reset via startGame()
			 * @param data (obj) layer.data as added in addLayer(layer)
			 * @param ctx (canvas 2D context) to perform actual rendering
			 */
			this.renderLayer = (idx, count, data, ctx) => {
				ctx.fillStyle = data.color;
				const midX = data.sizeX / 2;
				const midY = data.sizeY / 2;
				const thirdX = data.sizeX / 3;
				const thirdY = data.sizeY / 3;
				// for some variety, draw one of rect | circle | triangle | hexagon
				switch (data.id % 4) {
					case 0:
						this.gameApi.drawUtil({ 
							type: 'rect', 
							c: data.color,
							x: data.posX, 
							y: data.posY, 
							dx: data.sizeX, 
							dy: data.sizeY,
						});
						break;
					case 1:
						this.gameApi.drawUtil({ 
							type: 'ellipse', 
							c: data.color,
							x: data.posX, 
							y: data.posY, 
							mx: midX, 
							my: midY,
						});
						break;
					case 2:
						let trianglePath = [];
						if (midX > midY) {
							trianglePath = [
								{ x: data.posX, y: data.posY },
								{ x: data.posX + data.sizeX, y: data.posY },
								{ x: data.posX + midX, y: data.posY + data.sizeY }
							];
						} else {
							trianglePath = [
								{ x: data.posX, y: data.posY + data.sizeY },
								{ x: data.posX + data.sizeX, y: data.posY + data.sizeY },
								{ x: data.posX + midX, y: data.posY }
							];
						}
						this.gameApi.drawUtil({
							type: 'path',
							c: data.color,
							path: trianglePath
						});
						break;
					case 3:
						this.gameApi.drawUtil({
							type: 'path',
							c: data.color,
							path: [
								{ x: data.posX + thirdX, y: data.posY },
								{ x: data.posX + data.sizeX - thirdX, y: data.posY },
								{ x: data.posX + data.sizeX, y: data.posY + midY },
								{ x: data.posX + data.sizeX - thirdX, y: data.posY + data.sizeY },
								{ x: data.posX + thirdX, y: data.posY + data.sizeY },
								{ x: data.posX, y: data.posY + midY }
							]
						});
						break;
				}
			}
		} // END constructor
	} // END class
	console.log('window.sampleGame.init(gameApi) to run...');
})();
