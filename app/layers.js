function Layers(config) {
	this.config = config;
	this.data = [];
	
	this.thinkAll = () => {
		const cycleCount = this.config.renderCycle;
		// loop thru all layers and think
		for (i = 0; i < this.data.length; i++) {
			const layer = this.data.at(i);
			// check for think
			if (layer && layer.thinkEnabled === true) {
				layer.think(i, cycleCount, layer.data);
			}
			// check for removal since think() may lead to callback removeLayer(idx)
			if (!layer || layer.removeMe === true) {
				this.data.splice(i, 1);
				console.log("Removed Layer idx=" + i + " totalLayers=" + this.data.length);
				// need to decrement before loop increment since spliced array
				i--;
			}
		}
	}

	this.renderAll = (ctx) => {
		const cycleCount = this.config.renderCycle;
		// loop thru all layers and render
		for (i = 0; i < this.data.length; i++) {
			const layer = this.data.at(i);
			if (layer && layer.renderEnabled === true) {
				layer.render(i, cycleCount, layer.data, ctx);
			}
		}
	}

	this.addLayer = (layer) => {
		// check layer for render and think function
		//console.log("Adding layer data=" + JSON.stringify(layer, null, 2));
		const thinkEnabled = layer.hasOwnProperty('think');
		const renderEnabled = layer.hasOwnProperty('render');
		const layerToAdd = {
			// look at presense of think()/render()
			thinkEnabled,
			renderEnabled,
			// typically false until caller uses api.removeLayer(idx)
			removeMe: false,
			// link to provided think()/render() functions
			think: layer['think'],
			render: layer['render'],
			// link to caller specific data to be retained in layer
			data: layer.data || {}
		}
		//console.log("Added layer data=" + JSON.stringify(layerToAdd, null, 2));
		this.data.push(layerToAdd);
	}

	this.removeLayer = (idx) => {
		const toRemove = this.data.at(idx);
		if (toRemove) {
			//console.log("Remove Layer (flagged) idx=" + idx);
			toRemove.removeMe = true;
		}
	}

} // END class Layers
export default Layers;
