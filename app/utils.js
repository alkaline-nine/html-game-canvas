function Utils(canvas, config) {
	this.config = config;
	this.canvas = canvas;
	this.ctx = this.canvas.getContext('2d');

	/* Generic helper to draw various shapes */
	/* Requires { c, type, ... } */
	this.draw = (opts) => {
		//console.log("util.draw opts=" + JSON.stringify(opts));
		this.ctx.fillStyle = opts.c;
		switch(opts.type) {
			case 'rect':
				this.drawRect(opts);
				break;
			case 'ellipse':
				this.drawEllipse(opts);
				break;
			case 'path':
				this.drawPath(opts);
				break;
		}
	}

	/* Generic helper to draw multiple shapes */
	/* Requires [ { c, type, ... }, ... ] */
	this.drawAll = (optsArray) => {
		if (Array.isArray(optsArray)) {
			optsArray.forEach(o => this.draw(o));
		}
	}

	/* Requires { x, y, dx, dy } */
	this.drawRect = (opts) => {
		this.ctx.fillRect( //
			opts.x, //
			opts.y, //
			opts.dx, //
			opts.dy, //
		);
	}

	/* Requires { x, y, mx, my } */
	this.drawEllipse = (opts) => {
		this.ctx.beginPath();
		this.ctx.ellipse( //
			opts.x + opts.mx, //
			opts.y + opts.my, //
			opts.mx, //
			opts.my, //
			0, 0, //
			Math.PI * 2);
		this.ctx.closePath();
		this.ctx.fill();
	}

	/* Requires { path: [ { x, y } ] } */
	this.drawPath = (opts) => {
		this.ctx.beginPath();
		let len = Array.isArray(opts.path) ? opts.path.length : 0;
		if (len > 1) {
			let x = 0;
			let y = 0;
			let i = 0;
			opts.path.forEach(coord => {
				i++;
				x = coord.x || x;
				y = coord.y || y;
				if (i === 1) {
					// first pair, move to
					this.ctx.moveTo(x, y);
				} else {
					// after first pair, line to
					this.ctx.lineTo(x, y);
				}
				if (i === len) {
					// last pair, make sure this pair connects to first pair
					if (x !== opts.path[0].x || y !== opts.path[0].y) {
						x = opts.path[0].x || 0;
						y = opts.path[0].y || 0;
						this.ctx.lineTo(x, y);
					}
				}
			});
		}
		this.ctx.closePath();
		this.ctx.fill();
	}

}
export default Utils;
