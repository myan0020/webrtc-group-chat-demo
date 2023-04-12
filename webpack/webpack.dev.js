require("dotenv").config();

module.exports = {
  devtool: "inline-source-map",
  devServer: {
    hot: true,
    static: "public",
    open: true,
    port: process.env.WEBPACK_DEV_SERVER_PORT,

    // Falling back to '/' request when sending a request with an unknown path (eg: /home, /contact, ...)
    historyApiFallback: true,

    // Allowing CORS requests to api server's origin from webpack dev server's origin,
    proxy: [
      {
        context: JSON.parse(process.env.WEBPACK_DEV_SERVER_PROXY_AVALIABLE_PATHS),
        target: `http://localhost:${process.env.EXPRESS_SERVER_PORT}`,
        changeOrigin: true,
        secure: false,
      },
    ],
  },
};
