const webpack = require('webpack');
const path = require('path');
const srcPath = path.join(__dirname, '../app');

module.exports = {

    entry: ['babel-polyfill', path.resolve(srcPath + '/App.js')],

    resolve: {
        extensions: ['.js', '.jsx'],
        modules: [
            "node_modules"
        ]
    },

    module: {
        loaders: [
            {test: /\.(js|jsx)$/, exclude: /(node_modules)/, loaders: ['babel-loader']},
            {
                test: /\.css$/,
                loaders: ["style-loader", "css-loader?localIdentName=[name]__[local]___[hash:base64:5]", 'autoprefixer-loader?browsers=last 3 versions']
            },
            {
                test: /\.(jpe?g|png|gif|svg|eot|ttf|woff|woff2)$/,
                exclude: /(node_modules)/,
                loader: "file-loader?name=assets/[name].[ext]"
            }
        ]
    }

};
