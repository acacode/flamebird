const fs = require('fs')
const path = require('path')

function getEntries(dirPath) {
  return fs.readdirSync(dirPath).map(file => {
    const fileNameParts = file.split('.')
    const fileFormat = fileNameParts.pop()

    return {
      fullName: file,
      fileFormat: fileFormat === file ? 'dir' : fileFormat,
      name: fileNameParts.join('.'),
      relativePath: dirPath,
      absolutePath: path.join(__dirname, dirPath),
    }
  })
}

const createConfig = () => {
  const srcPath = './client'
  const distPath = './dist'
  const entries = getEntries(srcPath).filter(
    entry => entry.fileFormat !== 'dir'
  )

  return entries.map(entry => ({
    mode: 'production',
    entry: `${entry.relativePath}/${entry.fullName}`,
    output: {
      filename: `[name].${entry.fileFormat}`,
      path: path.resolve(
        __dirname,
        entry.relativePath.replace(srcPath, distPath)
      ),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/,
          loader: 'file-loader',
        },
        {
          test: /\.(html)$/,
          loader: 'html-loader',
        },
      ],
    },
  }))
}

module.exports = createConfig()
