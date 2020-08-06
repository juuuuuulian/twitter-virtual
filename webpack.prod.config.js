// prod webpack config - includes parsing frontend/backend shared html template and injecting our bundle
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');

require('dotenv').config()

module.exports = merge(baseConfig, {
    output: {
        filename: 'static/index.js',
        path: path.resolve(__dirname, 'twitter_virtual')
    },
    optimization: {
        minimizer: [new TerserWebpackPlugin({}), new OptimizeCSSAssetsPlugin({})]
    },
    plugins: [
        new webpack.DefinePlugin({
            RECAPTCHA_SITE_KEY: JSON.stringify(process.env.RECAPTCHA_SITE_KEY)
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/index.bundle.css'
        }),
        new HtmlWebpackPlugin({
            template: './frontend_src/index.html', // input shared template file
            filename: 'templates/index.html' // output server template file
        })
    ],
    mode: 'production'
});
