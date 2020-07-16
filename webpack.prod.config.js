// prod webpack config - includes parsing frontend/backend shared html template and injecting our bundle
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(baseConfig, {
    output: {
        filename: 'static/index.js',
        path: path.resolve(__dirname, 'twitter_virtual')
    },
    plugins: [
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
