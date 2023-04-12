const { merge } = require("webpack-merge");
const commonConfigCreator = require("./webpack.common");
const productionConfig = require("./webpack.prod");
const developmentConfig = require("./webpack.dev");

module.exports = (env, args) => {
  const commonConfig = commonConfigCreator(env, args);

  switch (args.mode) {
    case "development": {
      const config = merge(commonConfig, developmentConfig);
      return config;
    }
    case "production": {
      const config = merge(commonConfig, productionConfig);
      return config;
    }
    default:
      throw new Error("No matching configuration was found!");
  }
};
