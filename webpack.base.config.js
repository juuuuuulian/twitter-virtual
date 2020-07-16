// base webpack config, extended by webpack.dev.config and webpack.prod.config
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
    entry: './frontend_src/index.js'
};