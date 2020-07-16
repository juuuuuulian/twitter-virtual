// dev webpack config - includes dev server with a frontend/backend shared html template
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js')

module.exports = merge(baseConfig, {
    devtool: 'source-map',
    output: {
        filename: 'index.js'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'static/css/index.css'
        }),
        new HtmlWebpackPlugin({
            template: './frontend_src/index.html'
        })
    ],
    devServer: {
        contentBase: './twitter_virtual/'
    },
    mode: 'development'
});
