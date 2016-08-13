'use strict'

const
  co = require('co'),
  express = require('express'),
  log = require('loglevel'),
  path = require('path'),
  refresh = require('./refresh'),
  watch = require('./watch'),
  handler = require('./handler')

module.exports = co.wrap(function* (opts) {
  const
    app = express(),
    loglevel = opts.debug ? log.levels.DEBUG : log.levels.ERROR

  log.setLevel(loglevel, false)
  if (opts.refresh) {
    yield refresh(opts)
    log.debug('Refreshing completed!')
  }
  if (opts.watch) {
    watch(opts)
    log.debug('Watching started!')
  }

  app.use(handler(opts))
  app.use(express.static(path.join(opts.root, opts.src)))
  log.debug(`Listening: ${ opts.port }`)
  return app.listen(opts.port)
})
