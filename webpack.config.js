const path = require('path');

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
        filename: 'index.js',
        path: path.resolve(__dirname, 'twitter_virtual', 'static')
    }
};