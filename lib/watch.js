'use strict'

const
  co = require('co'),
  path = require('path'),
  log = require('loglevel'),
  chokidar = require('chokidar'),
  mkdirs = require('./mkdirs')

module.exports = function(opts) {
  const
    srcDir = path.join(opts.root, opts.src),
    cacheDir = path.join(opts.root, opts.cache)

  for (const entry of opts.patterns) {
    const handler = entry.handler
    chokidar.watch(entry.pattern, {
      cwd: srcDir,
      ignoreInitial: true
    }).on('all', co.wrap(function* (event, pathname) {
      const
        from = path.join(srcDir, pathname),
        to = path.join(cacheDir, pathname)

      log.debug(`Changed: ${ pathname }`)
      yield mkdirs(path.dirname(to))
      log.debug(`Compiling: ${ pathname }`)
      yield handler(from, to)
    }))
  }
}
