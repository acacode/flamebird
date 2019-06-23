const fs = require('fs')
const resolve = require('path').resolve

function getEntries(path, fileFormat) {
  return fs
    .readdirSync(path)
    .filter(file => file.indexOf(`.${fileFormat}`) > -1)
    .map(file => ({
      name: file.substring(0, file.length - (fileFormat.length + 1)),
      path: path + file,
    }))
    .reduce((memo, file) => {
      memo[file.name] = file.path
      return memo
    }, {})
}

const buildConfig = {
  js: {
    plugins: () => [],
    rules: () => [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  css: {
    plugins: () => [],
    rules: () => [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
          { loader: 'extract-loader' },
          'css-loader',
        ],
      },
    ],
  },
  html: {
    rules: () => [
      {
        test: /\.html$/,
        use: [ {
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }],
      },
    ],
  },
}

function createBuildConfig(path, fileFormat) {
  const config = buildConfig[fileFormat]
  console.log('getEntries(path, fileFormat)', getEntries(path, fileFormat))
  return {
    mode: 'production',
    entry: getEntries(path, fileFormat),
    output: {
      path: resolve(`./dist/${fileFormat}`),
      filename: `[name].${fileFormat}`,
    },
    module: {
      rules: config.rules(),
    },
    plugins: config.plugins && config.plugins(),
  }
}

module.exports = [
  createBuildConfig('./client/', 'js'),
  createBuildConfig('./client/scripts/', 'js'),
  createBuildConfig('./client/', 'css'),
  createBuildConfig('./client/styles/', 'css'),
  createBuildConfig('./client/', 'html'),
]
