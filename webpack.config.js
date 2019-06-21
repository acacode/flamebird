const fs = require('fs')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const resolve = require('path').resolve

function getEntries(path, isForJsFiles) {
  return fs
    .readdirSync(path)
    .filter(file => file.match(isForJsFiles ? /.*\.js$/ : /.*\.css$/))
    .map(file => {
      return {
        name: file.substring(0, file.length - 3),
        path: path + file,
      }
    })
    .reduce((memo, file) => {
      memo[file.name] = file.path
      return memo
    }, {})
}

const jsConfig = {
  rules: [
    {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    },
  ],
}

const cssConfig = {
  rules: [
    {
      test: /\.css$/,
      use: [MiniCSSExtractPlugin.loader, 'css-loader?minimize=true'],
    },
  ],
  plugins: [
    new MiniCSSExtractPlugin('[name]css'), // css file will override generated js file
  ],
}

function createBuildConfig(path, isForJsFiles) {
  const config = isForJsFiles ? jsConfig : cssConfig
  return {
    mode: 'production',
    entry: getEntries(path, isForJsFiles),
    output: {
      path: resolve(path),
      filename: '[name]' + (isForJsFiles ? '.js' : 'css'),
    },
    module: {
      rules: config.rules,
    },
    plugins: config.plugins,
  }
}

module.exports = [
  createBuildConfig('./lib/app/', true),
  createBuildConfig('./lib/app/scripts/', true),
  createBuildConfig('./lib/app/'),
  createBuildConfig('./lib/app/styles/'),
]
