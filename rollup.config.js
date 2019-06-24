// const packageJson = require('./package.json')
const fs = require('fs')
const path = require('path')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const css = require('rollup-plugin-css-only')
const { terser } = require('rollup-plugin-terser')
const commonjs = require('rollup-plugin-commonjs')

const DIST_PATH = './dist'

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

const entryConfig = {
  js: entry => ({
    input: `${entry.relativePath}/${entry.fullName}`,
    output: {
      file: `${DIST_PATH}/${entry.fullName}`,
      format: 'umd',
    },
    plugins: [
      resolve(),
      commonjs({
        include: 'node_modules/**',
      }),
      babel({
        runtimeHelpers: true,
        exclude: 'node_modules/**',
      }),
    ],
  }),
  // css: entry => ({
  //   input: `${entry.relativePath}/${entry.fullName}`,
  //   output: {
  //     file: `${DIST_PATH}/${entry.fullName}`,
  //   },
  //   plugins: [css({ output: entry.fullName })],
  // }),
  // html: () => ({}),
  other: () => false,
}

module.exports = (() =>
  [
    ...getEntries('./client'),
    // ...getEntries('./client/assets'),
    // ...getEntries('./client/libs'),
    // ...getEntries('./client/scripts'),
    // ...getEntries('./client/styles'),
  ]
    .filter(entry => entry.fileFormat !== 'dir')
    .map(entry =>
      entryConfig[entry.fileFormat]
        ? entryConfig[entry.fileFormat](entry)
        : entryConfig.other(entry)
    )
    .filter(Boolean))()

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
