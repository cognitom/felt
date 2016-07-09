const
  rollup = require('felt-rollup'),
  postcss = require('felt-postcss')

module.exports = {
  src: 'public',
  cache: 'cache',
  compilers: {
    '**/*.js': rollup(),
    '**/*.css': postcss()
  }
}
