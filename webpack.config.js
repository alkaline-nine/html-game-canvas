const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: 'production',
  // the game engine will be bundled as a single JS with webpack
  entry: {
    configuration: './app/configuration.js',
    keyinput: './app/keyinput.js',
    layers: './app/layers.js',
    gamer: './app/gamer.js',
    marsaglia: './app/marsaglia.js',
    utils: './app/utils.js',
    htmlGameCanvas: './app/index.js',
  },
  output: {
    // remove any old unused bundles before generating bundles (with different names)
    clean: true,
    filename: (data) => {
      // use the prefix colorRain for main bundle
      return data.chunk.name === 'htmlGameCanvas' ? '[name].[contenthash].js' : '[contenthash].js';
    },
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, "app")
        ],
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      },
    ]
  },
  plugins: [
    // the sampleGames JS file(s) will be copied to static folder as is without bundling
    new CopyPlugin({
      patterns: [
        { from: "sampleGames/", to: "static/" },
      ],
    }),
    new HtmlWebpackPlugin({
      cache: false,
      template: 'index.html',
      chunks: [
        // only include the main bundle, since minimize/mangle reduces this app to single file
        'htmlGameCanvas', 
      ]
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // TODO: figure out why empty files are generated, not a problem, but a nuisance
        terserOptions: {
            module: true,
            mangle: false,
            //mangle: true,
            keep_classnames: false,
            keep_fnames: false,
        }
      })
    ],
  },
};

