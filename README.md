# html-game-canvas
Game engine experiment for creating simple games, including keyboard input, using HTML canvas and JS


## Overview
The concept of this work is to implement a core workflow game engine that simplifies how rendered objects are managed and rendered each render cycle. The goals are to get something simple working, to allow as much freedom in the design to be flexible for different types of rendered objects, and to allow for fast prototyping of simple 2D graphics in the browser.

#### Game Engine
I use the words 'game engine' loosely to describe a cycle based think/render framework. Real game engines are not as simplistic as this implementation, yet, you may not need a fancy (heavy) game engine to do some cool things. 

#### Render Layers
The game engine includes a single interface for maintaining renderable objects, called layers. new layers can be added to the top of the stack with ```gameCanvas.api.addLayer({...})``` and removed by index in the stack with ```gameCanvas.api.removeLayer(index)```. The object provided when adding a layer may include 3 keys, 'think', 'render', and 'data', which will be used as think() and render() callbacks, providing all data on each call.

#### Think Cycle
The 'think' cycle in a game engine allows a pause in time for the 'game' (parent code using the engine) to assess the state of all objects and make decisions between render frames. Sometimes this involves small movements or style changes, but sometimes it may include removing a rendered object from the game.

#### Render Cycle
The 'render' cycle is when each layer managed in the game canvas calls the layers render() function. This should utilize the state data that was just processed in the think() call to render on the canvas. Note that layers that render first may be rendered over by future layers, so order matters. If you have a 'player' layer, that should probably be rendered last to always appear on top of other rendered layers. Also note, this framework does not get involved with texture loading and management, but it should be easy enough to integrate into a render() callback if you already have the knowledge to pre-load and draw with textures.

#### Input Handling
The game engine provides keyboard based input handling once the game canvas has been activated the first time. In order to use the input handler, both a list of key codes, and an input callback function must be configured. The addition of the keypress handling in this game engine meets a minimal bar, but ideally click handling would be integrated too.


## Usage
To use the example html game canvas, you need to install/bundle with npm and webpack, then open the HTML file in your local browser. 

This will run with the sample javascript game from the ```index.html``` file, which handles only the arrow key controls and will stop rendering after a number of cycles. But the game engine portion should be reusable with your own project by hijacking the ```dist/htmlGameCanvas.*.js``` file after bundling, and using similar setup code to whats in the index.html script.

Assuming nodejs/npm are installed locally, use the ```package.json``` scripts to 'bundle' or 'serve' via webpack after installing webpack and other dependencies.
```
npm install         <--- will install required dependencies for webpack
npm run bundle      <--- will create minified 'app' html/js in ./dist/ folder
npm run serve       <--- will serve all 'app' html/js on http://localhost:9997
```
Note about nodejs/npm version, this uses Webpack 5, and requires compatible local tool versions. Node v12.22.7 and npm v6.14.15 were used locally during development (linux).


## Why I wrote this
I have really been enjoying writing small projects in NodeJS, with Webpack, and using the browser as the primary runtime environment. This game engine will help speed up my own development when I have a new idea for something silly, so I can focus on the fun part instead of getting all the knobs and workflows right. I also hope this inspires someone else to tinker and reuse the engine.
