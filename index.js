'use strict'

const
  co = require('co'),
  path = require('path'),
  log = require('loglevel'),
  refresh = require('./lib/refresh'),
  watch = require('./lib/watch'),
  handler = require('./lib/handler')

/** default config file name */
const defaultConfigFileName = 'felt.config.js'

/** default values */
const defaults = {
  src: null,
  cache: 'cache',
  root: process.cwd(),
  update: 'once', // 'never', 'once' or 'allways'
  refresh: true, // refresh on starting
  watch: false,
  maxAge: 0,
  compilers: null,
  debug: false
}

module.exports = function(opts) {
  if (!opts || typeof opts == 'string') {
    const isConfig = /\.js$/
    if (!opts || isConfig.test(opts)) {
      try {
        const
          root = process.cwd(),
          configFile = path.join(root, opts || defaultConfigFileName)

        opts = require(configFile)
      } catch (e) {
        throw new Error('No config file')
      }
    } else {
      opts = { src: opts }
    }
  }

  opts = Object.assign({}, defaults, opts)

  if (!opts.src) throw new Error('Felt needs src directory. Ex: "public"')
  opts.compilers = opts.compilers || require('./felt.config.js').compilers

  const loglevel = opts.debug ? log.levels.DEBUG : log.levels.ERROR
  log.setLevel(loglevel, false)

  co(function* () {
    if (opts.refresh) yield refresh(opts)
    if (opts.watch) watch(opts)
  })

  return handler(opts)
}
