'use strict'

const
  co = require('co'),
  path = require('path'),
  log = require('loglevel'),
  globOriginal = require('glob'),
  promisify = require('tiny-promisify')

const glob = promisify(globOriginal)

module.exports = function(opts) {
  const
    srcDir = path.join(opts.root, opts.src),
    cacheDir = path.join(opts.root, opts.cache)

  co(function* () {
    for (const key in opts.compilers) {
      const
        compile = opts.compilers[key],
        files = yield glob(key, { cwd: opts.root })

      yield Promise.all(files.map(from => {
        const
          pathname = path.relative(srcDir, from),
          to = path.join(cacheDir, pathname)

        log.debug(`Compiling: ${ pathname }`)
        return compile(from, to)
      }))
    }
  })
}
