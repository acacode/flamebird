const plugins = [
  '@babel/plugin-syntax-dynamic-import',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-proposal-export-default-from',
  '@babel/plugin-proposal-export-namespace-from',
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-transform-runtime',
]
//
module.exports = {
  sourceMaps: true,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 2 versions', 'IE 11'],
        },
        modules: false,
      },
    ],
  ],
  plugins: plugins,
}
