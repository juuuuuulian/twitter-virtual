const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"  
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                loader: 'file-loader',
                options: {
                    publicPath: 'static',
                    name: 'fonts/[name].[ext]'
                },
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                loader: 'file-loader',
                options: {
                    publicPath: 'static',
                    name: 'images/[name].[ext]'
                }
            }
        ]
    },
    entry: './frontend_src/index.js',
    output: {
        filename: 'static/index.js',
        path: path.resolve(__dirname, 'twitter_virtual')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './frontend_src/index.html',
            filename: 'templates/index.html'
            //template: './twitter_virtual/templates/index.html',
            //filename: 'templates/test_template.html'
        })
    ],
    mode: 'production'
};