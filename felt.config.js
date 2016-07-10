const
  rollup = require('felt-rollup'),
  postcss = require('felt-postcss')

module.exports = {
  compilers: {
    '**/*.js': rollup(),
    '**/*.css': postcss()
  }
}
