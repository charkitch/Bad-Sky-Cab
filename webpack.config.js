const path = require("path");

module.exports = {
  entry: ('./main.js'),
  output: {
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".js", "*"]
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/env', '@babel/react']
          }
        },
        exclude: /node_modules/
      }
    ]
  }
};
