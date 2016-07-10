'use strict'

const
  fsp = require('fs-promise'),
  co = require('co'),
  log = require('loglevel'),
  del = require('del')

module.exports = co.wrap(function* (dir) {
  try {
    const stats = yield fsp.stat(dir)
    if (stats.isDirectory()) return
    
    log.debug(`Deleting: ${ dir } (because it's not a directory)`)
    yield del(dir)
  } catch (err) { /* */ }

  log.debug(`Creating: ${ dir }`)
  yield fsp.mkdirs(dir)
})
