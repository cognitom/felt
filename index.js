'use strict'

const
  co = require('co'),
  log = require('loglevel'),
  refresh = require('./lib/refresh'),
  watch = require('./lib/watch'),
  handler = require('./lib/handler')

/** default values */
const defaults = {
  src: null,
  cache: 'cache',
  root: process.cwd(),
  handlers: {}, // default handlers for each extension
  patterns: [], // array of globs to handle
  update: 'once', // 'never', 'once' or 'allways'
  refresh: true, // refresh on starting
  watch: false,
  maxAge: 0,
  debug: false
}

module.exports = function(...configs) {
  const opts = Object.assign({}, defaults)

  // composition of recipes, configs and overwrites
  for (const config of configs) {
    config.handlers = Object.assign(opts.handlers, config.handlers || {})
    Object.assign(opts, config)
  }

  // some checks and modifications
  if (!opts.src) throw new Error('Felt needs src directory. Ex: "public"')
  if (!opts.patterns.length) {
    opts.patterns = Object.keys(opts.handlers).map(ext => `**/*${ ext }`)
  }

  // wires up the patterns and handlers
  opts.patterns = opts.patterns.map(pattern => {
    if (typeof pattern == 'string') pattern = { pattern }
    if (!pattern.pattern) throw new Error('No pattern')
    if (pattern.handler) return pattern
    for (const ext in opts.handlers)
      if (new RegExp(`\\${ ext }$`).test(pattern.pattern))
        return Object.assign(pattern, { handler: opts.handlers[ext] })
    throw new Error(`No handler refistered: ${ pattern }`)
  })

  const loglevel = opts.debug ? log.levels.DEBUG : log.levels.ERROR
  log.setLevel(loglevel, false)

  co(function* () {
    if (opts.refresh) yield refresh(opts)
    if (opts.watch) watch(opts)
  })

  return handler(opts)
}
