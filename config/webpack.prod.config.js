const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const path = require('path');
const baseConfig = require('./webpack.base.config.js');

module.exports = merge(baseConfig, {
  output: {
    path: path.resolve(__dirname + '/../release/'),
    filename: './js/bundle.js',
  },

  module: {
    loaders: [
      {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: ["css-loader", "stylus-loader?paths=node_modules/bootstrap-stylus/stylus/"]
        })
      },
      {
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff|woff2)$/,
        exclude: /(node_modules)/,
        loader: "file-loader?name=/assets/[name].[ext]"
      }
    ]
  },

  plugins: [
    // Extract imported CSS into own file
    new ExtractTextPlugin('./css/style.css'),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    new webpack.optimize.UglifyJsPlugin(),
    // Minify CSS
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  ],


});