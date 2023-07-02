module.exports = {
  devtool: "source-map",
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        venders: {
          test: /[\\/]node_modules[\\/]/,
          name: "venders",
        },
      },
    },
  },
};
