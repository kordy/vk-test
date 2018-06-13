const merge = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('./webpack.base.config.js');
const fs = require('fs');
const NODE_ENV = 'development';

module.exports = merge(baseConfig, {

  output: {
    filename: 'bundle.js',
    publicPath: 'http://localhost:8080/dev/'
  },

  devtool: 'eval-source-map',

  devServer: {
    host: '0.0.0.0',
    port: 8080,
    hot: true,
    historyApiFallback: true,
    setup(app) {
      app.get('/', (req, res) => {
        fs.readFile(process.cwd() + '/dev/index.html', 'utf8', (err, content) => {
          if (err) throw err;
          res.send(content, 200);
        });
      });
    }
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(NODE_ENV)
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.SourceMapDevToolPlugin()
  ],

  module: {
    loaders: [
      {
        test: /\.styl$/,
        loaders: ['style-loader', "css-loader", "stylus-loader?paths=node_modules/bootstrap-stylus/stylus/"]
      },
      {
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff|woff2)$/,
        exclude: /(node_modules)/,
        loader: "file-loader?name=assets/[name].[ext]"
      }
    ]
  }
});