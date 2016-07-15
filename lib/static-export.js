'use strict'

const
  co = require('co'),
  path = require('path'),
  log = require('loglevel'),
  cpy = require('cpy'),
  refresh = require('./refresh'),
  mkdirs = require('./mkdirs')

module.exports = co.wrap(function* (opts) {
  const
    loglevel = opts.debug ? log.levels.DEBUG : log.levels.ERROR,
    src = path.join(opts.root, opts.src),
    dest = path.join(opts.root, opts.cache)

  log.setLevel(loglevel, false)

  yield mkdirs(dest)
  yield cpy(['**/*', '!**/.*'], dest, { cwd: src })
  yield refresh(opts)
})
