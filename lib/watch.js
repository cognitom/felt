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

  for (const key in opts.compilers) {
    const compile = opts.compilers[key]
    chokidar.watch(key, {
      cwd: opts.root,
      ignoreInitial: true
    }).on('all', co.wrap(function* (event, from) {
      const
        pathname = path.relative(srcDir, from),
        to = path.join(cacheDir, pathname)

      yield mkdirs(path.dirname(to))
      log.debug(`Compiling: ${ pathname }`)
      yield compile(from, to)
    }))
  }
}
