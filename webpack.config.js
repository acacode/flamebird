const path = require('path')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const srcFolder = process.env.SRC_DIR || path.resolve(__dirname, './client')
const destFolder = process.env.DEST_DIR || path.resolve(__dirname, './dist')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  devtool: isDev ? 'eval' : false,
  mode: isDev ? 'development' : 'production',
  target: 'web',
  entry: {
    'index.html': path.resolve(srcFolder, './index.html'),
    global: path.resolve(srcFolder, './global.js'),
  },
  output: {
    path: destFolder,
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loaders: [
          'file-loader?name=[name].html',
          'extract-loader',
          {
            loader: 'html-loader',
            options: {
              minimize: !isDev,
              root: srcFolder,
              attrs: ['img:src', 'link:href'],
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              fallback: 'responsive-loader',
              quality: 75,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['file-loader', 'extract-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: isDev
      ? []
      : [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     minify: {
  //       html5: true,
  //       removeComments: true,
  //       collapseWhitespace: true,
  //       minifyCSS: true,
  //       minifyJS: true,
  //       // minifyURLs: true
  //     },
  //     template: entryHtmlFileAbsolutePath,
  //   }),
  // ],
}
