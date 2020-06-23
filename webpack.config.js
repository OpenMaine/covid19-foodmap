const glob = require("glob");
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
     map: glob.sync("./js/**/*.js"),
     home: './js/home/home.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module:{
    rules:[
      {test: /\.js$/ , loader:'babel-loader', exclude: '/node_modules/'}
    ]
  }
}