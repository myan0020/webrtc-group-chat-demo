const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

require("dotenv").config();

//
// TODO [Created on 2022-5-29]: test react refresh (HMR)
//
// 1. https://github.com/pmmmwh/react-refresh-webpack-plugin
// 2. https://dev.to/workingeeks/speeding-up-your-development-with-webpack-5-hmr-and-react-fast-refresh-of8
// 3. https://www.zhihu.com/search?type=content&q=react%20fast%20refresh
//
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
//

module.exports = (env, argv) => {
  const isEnvDevelopment = argv.mode === "development";

  const config = {
    devtool: isEnvDevelopment ? "inline-source-map" : "source-map",

    devServer: isEnvDevelopment
      ? {
          hot: true,
          static: "public",
          open: true,
          port: process.env.WEBPACK_DEV_SERVER_PORT,

          // Falling back to '/' request when sending a request with an unknown path (eg: /home, /contact, ...)
          historyApiFallback: true,

          // Allowing CORS requests to api server's origin from webpack dev server's origin,
          proxy: [
            env.proxy === "expressServer" && {
              context: JSON.parse(process.env.WEBPACK_DEV_SERVER_PROXY_AVALIABLE_PATHS),
              target: `http://localhost:${process.env.EXPRESS_SERVER_PORT}`,
              changeOrigin: true,
              secure: false,
            },
          ].filter(Boolean),
        }
      : {},

    entry: {
      index: "./react_client/index.jsx",
    },

    output: {
      filename: "js/[name]_bundle.js", // [entry name ('index')]_bundle.js
      path: path.resolve(process.cwd(), "build"), // webpack process should always be executed in the root project directory
      publicPath: "",
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
        title: "webrtc-group-chat-demo",
        template: path.resolve(process.cwd(), "./react_client/index.html"),
        filename: "index.html",
      }),

      new webpack.DefinePlugin({
        // ... any other global vars
        env: JSON.stringify(process.env),
      }),

      // isEnvDevelopment && new BundleAnalyzerPlugin(),

      new webpack.DefinePlugin({
        "process.env.NODE_ENV": isEnvDevelopment
          ? JSON.stringify("development")
          : JSON.stringify("production"),
      }),
    ].filter(Boolean),

    module: {
      rules: [
        // {
        //   test: /\.(t|j)sx?$/,
        //   exclude: /node_modules/,
        //   loader: "ts-loader",
        // },

        {
          test: /\.(t|j)sx?$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            //
            // TODO [Created on 2022-5-29]: test react refresh (HMR)
            //
            // 1. https://github.com/pmmmwh/react-refresh-webpack-plugin
            // 2. https://dev.to/workingeeks/speeding-up-your-development-with-webpack-5-hmr-and-react-fast-refresh-of8
            // 3. https://www.zhihu.com/search?type=content&q=react%20fast%20refresh
            //
            plugins: [isEnvDevelopment && require.resolve("react-refresh/babel")].filter(Boolean),
            //
          },
        },

        // addition - add source-map support
        // { test: /\.js$/, exclude: /node_modules/, loader: "source-map-loader" },

        {
          // local styles should use modular css
          test: /\.css$/i,
          exclude: /node_modules|react_client\/index.css/,
          include: /react_client\/component/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
              options: {
                modules: {
                  //
                  // TODO [Created on 2022-5-30]: test modular css naming
                  //
                  // 1. https://www.freecodecamp.org/news/part-1-react-app-from-scratch-using-webpack-4-562b1d231e75/
                  //
                  localIdentName: "[name]_[local]_[hash:base64]",
                },
              },
            },
          ],
        },
        {
          // global styles should not use modular css
          test: /\.css$/i,
          exclude: /node_modules/,
          include: /react_client\/index.css/,
          use: [
            {
              loader: "style-loader",
            },
            {
              loader: "css-loader",
            },
          ],
        },
        {
          test: /\.css$/,
          include: /node_modules/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
          include: /react_client\/resource/,
          generator: {
            filename: "images/[hash].[ext]",
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[hash].[ext]",
          },
        },
      ],
    },
    resolve: {
      extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx"],

      // aiming to shorten so long module path names when importing these modules inside a << different type >> of module
      // so, all folders directly under "react_client" folder should collect modules with different types
      //
      // eg: importing a React context module (at "./react_client/context/") into a React feature component module (at "./react_client/component/")
      //
      alias: {
        component: path.resolve(process.cwd(), "./react_client/component/"),
        context: path.resolve(process.cwd(), "./react_client/context/"),
        store: path.resolve(process.cwd(), "./react_client/store/"),
        util: path.resolve(process.cwd(), "./react_client/util/"),
        service: path.resolve(process.cwd(), "./react_client/service/"),
        resource: path.resolve(process.cwd(), "./react_client/resource/"),
        hook: path.resolve(process.cwd(), "./react_client/hook/"),
        constant: path.resolve(process.cwd(), "./react_client/constant/"),
      },
    },
  };

  return config;
};
