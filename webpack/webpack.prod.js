module.exports = {
  devtool: "source-map",
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      minChunks: 1,
      minSize: 0,
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react_related_vender",
        },
        reactRouter: {
          test: /[\\/]node_modules[\\/](react-router|react-router-dom)/,
          name: "react_router_related_vender",
        },
        redux: {
          test: /[\\/]node_modules[\\/](@reduxjs|react-redux)/,
          name: "redux_related_vender",
        },
        styledComponents: {
          test: /[\\/]node_modules[\\/](styled-components)/,
          name: "styled_related_components_vender",
        },
        corejs: {
          test: /[\\/]node_modules[\\/](core-js)/,
          name: "corejs_related_vender",
        },
        others: {
          test: /[\\/]node_modules[\\/]/,
          name: "other-venders",
        },
      },
    },
  },
};
