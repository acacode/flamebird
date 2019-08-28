/* eslint-disable */


module.exports = {
  "sourceMaps": true,
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": ["last 2 versions"]
        },
        "modules": "commonjs"
      },
    ]
  ],
  "ignore": [/[\/\\]core-js/, /@babel[\/\\]runtime/],
  "plugins": [
    "@babel/plugin-transform-runtime",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-export-namespace-from",
    "@babel/plugin-proposal-object-rest-spread"
  ]
}