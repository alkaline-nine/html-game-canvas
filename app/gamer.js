function Gamer(config, keyinput, layers, canvas) {
	this.config = config;
	this.keyinput = keyinput;
	this.layers = layers;
	this.canvas = canvas;

	this.startGame = () => {
		// set active and begin
		console.log('Gamer: HTML Game Canvas started!');
		this.canvas.width = this.config.canvas.width;
		this.canvas.height = this.config.canvas.height;
		this.config.renderCycle = 0;
		this.config.active = true;
		if (this.config.canvas.activated !== true) {
			this.config.canvas.activated = true;
			this.keepGaming();
		}
	}

	this.stopGame = () => {
		// set active to false
		this.config.active = false;
		console.log('Gamer: HTML Game Canvas stopped!');
	}

	this.checkInputs = () => {
		// check for inputs and setup input callback
		if (this.config.input.callback !== null) {
			const keys = this.keyinput.getInputs();
			if (keys && Array.isArray(keys) && keys.length > 0) {
				// make call to callback function
				this.config.input.callback(keys);
			}
		}

	}
	// Check active, Think, Render, Next frame
	this.keepGaming = () => {
		// first handle any input since last frame
		this.checkInputs();
		// then if active, think and render
		if (this.config.active) {
			let ctx = this.canvas.getContext('2d');
			this.config.renderCycle++;
			this.layers.thinkAll();
			this.clearCanvas(ctx);
			this.layers.renderAll(ctx);
		}
		// loop
		this.nextFrame();
	}

	this.clearCanvas = (ctx) => {
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
	}

	this.nextFrame = () => {
		this.timerOrFrame();
	}

	// Compare different render cycle types performance, or to slow down for debugging
	this.timerOrFrame = () => {
		if (config.canvas.renderCycleType === 'timer') {
			window.setTimeout(() => { this.keepGaming() }, config.canvas.timer);
		} else if (config.canvas.renderCycleType === 'frame') {
			window.requestAnimationFrame(this.keepGaming);
		}
	}
} // END class Gamer
export default Gamer;
