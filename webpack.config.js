const path = require("path");

module.exports = {
  entry: ('./main.js'),
  output: {
    path: path.resolve(__dirname, 'app'),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".js", ".png", "*"]
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
