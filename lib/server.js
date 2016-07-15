'use strict'

const
  co = require('co'),
  express = require('express'),
  path = require('path'),
  refresh = require('./refresh'),
  watch = require('./watch'),
  handler = require('./handler')

module.exports = co.wrap(function* (opts) {
  const
    app = express(),
    loglevel = opts.debug ? log.levels.DEBUG : log.levels.ERROR

  log.setLevel(loglevel, false)
  if (opts.refresh) yield refresh(opts)
  if (opts.watch) watch(opts)

  app.use(handler(opts))
  app.use(express.static(opts.src))
  app.listen(opts.port)
})
