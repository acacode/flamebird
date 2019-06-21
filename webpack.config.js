const fs = require('fs')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const resolve = require('path').resolve

function getEntries(path, fileFormat) {
  return fs
    .readdirSync(path)
    .filter(file => file.match(new RegExp(`/.*\.${fileFormat}$/`))
    .map(file => {
      return {
        name: file.substring(0, file.length - fileFormat.length),
        path: path + file,
      }
    }))
    .reduce((memo, file) => {
      memo[file.name] = file.path
      return memo
    }, {})
}

const buildConfig = {
  js: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  css: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCSSExtractPlugin.loader, 'css-loader?minimize=true'],
      },
    ],
    plugins: [
      new MiniCSSExtractPlugin('[name].css'), // css file will override generated js file
    ],
  }
}

function createBuildConfig(path, fileFormat) {
  const config = buildConfig[fileFormat]
  return {
    mode: 'production',
    entry: getEntries(path, fileFormat),
    output: {
      path: resolve(path),
      filename: `[name].${fileFormat}`,
    },
    module: {
      rules: config.rules,
    },
    plugins: config.plugins,
  }
}

module.exports = [
  createBuildConfig('./lib/app/', 'js'),
  createBuildConfig('./lib/app/scripts/', 'js'),
  createBuildConfig('./lib/app/', 'css'),
  createBuildConfig('./lib/app/styles/', 'css'),
]
