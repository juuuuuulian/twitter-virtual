// base webpack config, extended by webpack.dev.config and webpack.prod.config
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './frontend_src/index.js',
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
                test: /.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'static/fonts/',
                            name: '[name].[ext]',
                            publicPath: '/static/fonts/'
                        }
                    }
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'static/images/',
                            name: '[name].[ext]',
                            publicPath: '/static/images/'
                        }
                    }
                ]
            }
        ]
    }
};
