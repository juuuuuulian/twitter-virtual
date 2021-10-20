// dev webpack config - includes dev server with a frontend/backend shared html template
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js')
const webpack = require('webpack');

require('dotenv').config()

module.exports = merge(baseConfig, {
    devtool: 'source-map',
    output: {
        filename: '[name].js'
    },
    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom'
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            RECAPTCHA_SITE_KEY: JSON.stringify(process.env.RECAPTCHA_SITE_KEY)
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].css'
        }),
        new HtmlWebpackPlugin({
            template: './frontend_src/index.html',
            chunks: ["index"],
            filename: 'index.html'
        }),
        new HtmlWebpackPlugin({
            template: './frontend_src/index.html',
            chunks: ["success"],
            filename: 'success.html'
        })
    ],
    devServer: {
        static: ['./twitter_virtual/'],
        hot: true
    },
    mode: 'development'
});
