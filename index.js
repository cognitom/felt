'use strict'

const
  co = require('co'),
  log = require('loglevel'),
  refresh = require('./lib/refresh'),
  watch = require('./lib/watch'),
  handler = require('./lib/handler'),
  configBuilder = require('./lib/config-builder')

module.exports = function(...configs) {
  const opts = configBuilder(...configs)

  const loglevel = opts.debug ? log.levels.DEBUG : log.levels.ERROR
  log.setLevel(loglevel, false)

  co(function* () {
    if (opts.refresh) yield refresh(opts)
    if (opts.watch) watch(opts)
  })

  return handler(opts)
}
