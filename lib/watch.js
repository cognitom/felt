'use strict'

const
  path = require('path'),
  log = require('loglevel'),
  chokidar = require('chokidar')

module.exports = function(opts) {
  const
    srcDir = path.join(opts.root, opts.src),
    cacheDir = path.join(opts.root, opts.cache)

  for (const key in opts.compilers) {
    const compile = opts.compilers[key]
    chokidar.watch(key, {
      cwd: opts.root,
      ignoreInitial: true
    }).on('all', (event, from) => {
      const
        pathname = path.relative(srcDir, from),
        to = path.join(cacheDir, pathname)

      log.debug(`Compiling: ${ pathname }`)
      compile(from, to)
    })
  }
}
