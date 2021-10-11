// base webpack config, extended by webpack.dev.config and webpack.prod.config
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './frontend_src/index.jsx',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader", "eslint-loader"]
            },
            {
                test: /.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/fonts/[hash][ext][query]'
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/images/[hash][ext][query]'
                }
            }
        ]
    }
};
