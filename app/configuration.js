function Configuration () {
	this.config = {
		active: false,
		renderCycle: 0,               // count of render cycles since last startGame()
		canvas: {
			width: 640,               // number of horizontal pixels
			height: 480,              // number of vertical pixels
			renderCycleType: 'frame', // 'timer' to go slower or 'frame' for browser controlled frame rate
			timer: 100,               // only used when renderCycleType = 'timer'
			activated: false,         // set the first time the render loop is started
		},
		input: {
			keys: [],
			callback: (keys) => {},   // set via api, to be called at the start of each think cycle if inputs recvd
		},
	}
} // END class Configuration
export default Configuration;
