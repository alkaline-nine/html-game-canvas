function KeyInput(config) {
	this.config = config;
	this.inputs = [];

	this.setKeys = (keys) => {
		this.config.input.keys = keys;
		console.log('KeyInput: setting keys=', JSON.stringify(this.config.input.keys));
	}

	this.setCallback = (callback) => {
		this.config.input.callback = callback;
		console.log('KeyInput: setting callback function');
	}

	this.handleKeys = (event) => {
		// if keys configured, and matching key pressed
		if (this.config.input.keys.length > 0) {
			console.log('KeyInput: checking event=' + event);
			if (this.config.input.keys.some(k => k === event.keyCode)) {
				console.log('KeyInput: handling key=' + event.keyCode);
				this.inputs.push(event.keyCode);
				// since we handled this key, prevent any other handling
				event.preventDefault();
			}
		}
	}

	this.getInputs = () => {
		if (this.inputs.length > 0) {
			const toReturn = this.inputs;
			this.inputs = [];
			console.log('KeyInput: returning inputs=' + JSON.stringify(toReturn));
			return toReturn;
		}
		// else none
		return [];
	}

} // END class KeyInput
export default KeyInput;
