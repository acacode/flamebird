// const packageJson = require('./package.json')
const fs = require('fs')
const path = require('path')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const { terser } = require('rollup-plugin-terser')
// const commonjs = require('rollup-plugin-commonjs')

// const productionBuildPlugins = [
//   replace({
//     'process.env.NODE_ENV': JSON.stringify('production'),
//   }),
//   terser({
//     compress: {
//       pure_getters: true,
//       unsafe: true,
//       unsafe_comps: true,
//       warnings: false,
//     },
//   }),
// ]

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

const rollupConfig = (() => {
  const entries = [
    ...getEntries('./client'),
    ...getEntries('./client/assets'),
    ...getEntries('./client/libs'),
    ...getEntries('./client/scripts'),
    ...getEntries('./client/styles'),
  ].filter(entry => entry.fileFormat !== 'dir')

  return entries.map(entry => {
    const inputPath = entry.relativePath
    const outputPath = './dist'
    return {
      input: `${inputPath}/${entry.fullName}`,
      output: {
        file: `${outputPath}/${entry.fullName}`,
      },
      plugins: [
        // resolve({
        //   jsnext: true,
        // }),
        // babel({
        //   exclude: 'node_modules/**',
        // }),
        // replace({
        //   'process.env.NODE_ENV': JSON.stringify('development'),
        // }),
      ],
    }
  })
})()

module.exports = rollupConfig
// [
//   ...rollupConfig,
//   {
//     ...inputOutputConfig('dist/react-stonex.js', 'umd', {
//       name: 'ReactStonex',
//     }),
//     plugins: [
//       resolve({
//         jsnext: true,
//       }),
//       babel({
//         exclude: 'node_modules/**',
//         presets: ['@babel/preset-react'],
//       }),
//       replace({
//         'process.env.NODE_ENV': JSON.stringify('development'),
//       }),
//     ],
//   },
//   {
//     ...inputOutputConfig('dist/react-stonex.min.js', 'umd', {
//       name: 'ReactStonex',
//     }),
//     external: deps,
//     plugins: [
//       resolve({
//         jsnext: true,
//       }),
//       babel({
//         exclude: 'node_modules/**',
//         presets: ['@babel/preset-react'],
//       }),
//       ...productionBuildPlugins,
//     ],
//   },
// ]
