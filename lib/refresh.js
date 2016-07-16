'use strict'

const
  co = require('co'),
  path = require('path'),
  log = require('loglevel'),
  globOriginal = require('glob'),
  promisify = require('tiny-promisify'),
  mkdirs = require('./mkdirs')

const glob = promisify(globOriginal)

module.exports = co.wrap(function* (opts) {
  const
    srcDir = path.join(opts.root, opts.src),
    cacheDir = path.join(opts.root, opts.cache)

  for (const entry of opts.patterns) {
    const
      handler = entry.handler,
      files = yield glob(entry.pattern, { cwd: srcDir, ignore: opts.excludes })

    yield Promise.all(files.map(pathname => co(function *(){
      const
        from = path.join(srcDir, pathname),
        to = path.join(cacheDir, pathname)

      yield mkdirs(path.dirname(to))
      log.debug(`Compiling: ${ pathname }`)
      try {
        yield handler(from, to)
      } catch (err) {
        log.error(err)
      }
    })))
  }
})
