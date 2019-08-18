const path = require('path')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const dree = require('dree')

const srcFolder = process.env.SRC_DIR || path.resolve(__dirname, './client')
const destFolder = process.env.DEST_DIR || path.resolve(__dirname, './public')

const options = {
  stat: false,
  normalize: true,
  followLinks: true,
  size: true,
  hash: true,
  depth: 1,
  extensions: ['html'],
}

const createConfig = entryHtmlFile => {
  const entryHtmlFileAbsolutePath = path.resolve(
    srcFolder,
    `./${entryHtmlFile}`
  )

  return {
    target: 'web',
    entry: {
      'index.html': path.resolve(srcFolder, './index.html'),
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
                minimize: true,
                root: path.resolve(__dirname, './src'),
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
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    plugins: [
      new HtmlWebpackPlugin({
        minify: {
          html5: true,
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          // minifyURLs: true
        },
        template: entryHtmlFileAbsolutePath,
      }),
    ],
  }
}

module.exports = dree
  .scan(srcFolder, options)
  .children.filter(o => o.extension === 'html')
  .map(o => createConfig(o.name))
