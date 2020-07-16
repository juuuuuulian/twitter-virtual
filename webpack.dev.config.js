// dev webpack config - includes dev server with a frontend/backend shared html template
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js')

module.exports = merge(baseConfig, {
    output: {
        filename: 'index.bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './frontend_src/index.html'
        })
    ],
    devServer: {
        contentBase: './twitter_virtual/'
    },
    mode: 'development'
});
