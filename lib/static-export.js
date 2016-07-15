'use strict'

const
  co = require('co'),
  path = require('path'),
  log = require('loglevel'),
  cpy = require('cpy'),
  del = require('del'),
  refresh = require('./refresh'),
  mkdirs = require('./mkdirs')

module.exports = co.wrap(function* (opts) {
  const
    loglevel = opts.debug ? log.levels.DEBUG : log.levels.ERROR,
    src = path.join(opts.root, opts.src),
    dest = path.join(opts.root, opts.cache)

  log.setLevel(loglevel, false)
  const
    patterns = opts.patterns.map(entry => `!${ entry.pattern }`),
    globs = ['**', '!**/.*'].concat(patterns)

  yield mkdirs(dest)
  yield del('**', { cwd: dest })
  log.debug('All files cleared')
  yield cpy(globs, dest, { cwd: src, nodir: true })
  log.debug('All files copied except the files handled by Felt')
  yield refresh(opts)
  log.debug(`Exporting completed to: ${ opts.cache }`)
})
