const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

require("dotenv").config();

module.exports = (env, args) => {
  const isEnvDevelopment = args.mode === "development";
  return {
    target: "web", // can be omitted as default is 'web'
    entry: {
      index: "./react_client/index.jsx",
    },
    output: {
      filename: "js/[name]_[contenthash]_bundle.js", // [entry name ('index')]_bundle.js
      path: path.resolve(process.cwd(), "build"), // webpack process should always be executed in the root project directory
      publicPath: "",
      clean: true,
    },
    resolve: {
      extensions: [".jsx", "..."],
      // aiming to shorten so long module path names when importing these modules inside a << different type >> of module
      // so, all folders directly under "react_client" folder should collect modules with different types
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
    plugins: [
      isEnvDevelopment && new ReactRefreshWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: "webrtc-group-chat-demo",
        template: path.resolve(process.cwd(), "./react_client/index.html"),
        filename: "index.html",
      }),
      new webpack.DefinePlugin({
        // ... any other global vars
        env: JSON.stringify(process.env),
      }),
      env.analyzer && new BundleAnalyzerPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": isEnvDevelopment
          ? JSON.stringify("development")
          : JSON.stringify("production"),
      }),
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            plugins: [isEnvDevelopment && require.resolve("react-refresh/babel")].filter(Boolean),
          },
        },
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
  };
};
