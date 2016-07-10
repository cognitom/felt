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
  const
    root = process.cwd(),
    isConfig = /\.js$/

  let configFile = path.join(root, defaultConfigFileName)

  if (opts && typeof opts == 'string') {
    if (isConfig.test(opts)) {
      configFile = path.join(root, opts)
      opts = {}
    } else {
      opts = { src: opts }
    }
  }
  opts = opts || {}

  try {
    const config = require(configFile)
    opts = Object.assign({}, defaults, config, opts)
  } catch (e) {
    opts = Object.assign({}, defaults, opts)
  }

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
