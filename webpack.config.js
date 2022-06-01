const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

//
// TODO [Created on 2022-5-29]: test react refresh (HMR)
//
// 1. https://github.com/pmmmwh/react-refresh-webpack-plugin
// 2. https://dev.to/workingeeks/speeding-up-your-development-with-webpack-5-hmr-and-react-fast-refresh-of8
// 3. https://www.zhihu.com/search?type=content&q=react%20fast%20refresh
//
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
//

module.exports = (env, argv) => {
  const isEnvDevelopment = (argv.mode === 'development');
  const config = {
    devtool: isEnvDevelopment ? 'inline-source-map' : 'source-map',

    devServer: isEnvDevelopment ? {
      hot: true,
      host: 'localhost',
      port: 9000,
      static: path.resolve(__dirname, 'public'),
      open: true,

      // Falling back to '/' request when sending a request with an unknown path (eg: /home, /contact, ...)
      historyApiFallback: true,
    } : {},

    entry: {
      index: './src/index.jsx'
    },

    output: {
      filename: '[name]_bundle.js', // [entry name ('index')]_bundle.js
      path: path.resolve(__dirname, 'build'),
      clean: true,
    },

    plugins: [
      //
      // TODO [Created on 2022-5-29]: test react refresh (HMR)
      //
      // 1. https://github.com/pmmmwh/react-refresh-webpack-plugin
      // 2. https://dev.to/workingeeks/speeding-up-your-development-with-webpack-5-hmr-and-react-fast-refresh-of8
      // 3. https://www.zhihu.com/search?type=content&q=react%20fast%20refresh
      //
      isEnvDevelopment && new ReactRefreshWebpackPlugin(),
      //

      new HtmlWebpackPlugin({
        title: 'React Template',
        template: "./src/index.html",
        filename: "index.html"
      })
    ].filter(Boolean),

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            //
            // TODO [Created on 2022-5-29]: test react refresh (HMR)
            //
            // 1. https://github.com/pmmmwh/react-refresh-webpack-plugin
            // 2. https://dev.to/workingeeks/speeding-up-your-development-with-webpack-5-hmr-and-react-fast-refresh-of8
            // 3. https://www.zhihu.com/search?type=content&q=react%20fast%20refresh
            //
            plugins: [isEnvDevelopment && require.resolve('react-refresh/babel')].filter(Boolean)
            //
          },
        },
        {
          test: /\.css$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  //
                  // TODO [Created on 2022-5-30]: test modular css naming
                  //
                  // 1. https://www.freecodecamp.org/news/part-1-react-app-from-scratch-using-webpack-4-562b1d231e75/
                  //
                  localIdentName: "[name]_[local]_[hash:base64]"
                }
              }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ]
    }
  };

  return config;
};