'use strict'

const
  fsp = require('fs-promise'),
  co = require('co'),
  url = require('url'),
  path = require('path'),
  log = require('loglevel'),
  minimatch = require('minimatch')

/**
 * serves a cache file
 */
function serve(res, file, maxAge) {
  res.status(200)
    .set('Cache-Control', `max-age=${ maxAge }`)
    .sendFile(file, err => {
      if (err) {
        log.error(err)
        res.status(err.status).end()
        return
      }
    })
}

/**
 * finds a compiler matched with pathname
 */
function find(pathname, compilers) {
  for (const key in compilers)
    if (minimatch(pathname, key))
      return compilers[key]
  return null
}

module.exports = function(opts) {
  return co.wrap(function* (req, res, next) {
    const
      pathname = url.parse(req.url).pathname,
      src = path.join(opts.root, opts.src, pathname),
      cache = path.join(opts.root, opts.cache, pathname)

    if (req.method != 'GET' && req.method != 'HEAD') return next()

    if (/\.map$/.test(pathname)) {
      const mapfile = `${ cache }.map`
      try {
        yield fsp.access(mapfile, fsp.F_OK)
        serve(res, mapfile, opts.maxAge)
        return
      } catch (err) {
        return next()
      }
    }

    const compile = find(pathname, opts.compilers)
    if (!compile) return next()

    try {
      yield fsp.access(src, fsp.F_OK)
    } catch (err) {
      return next()
    }

    if (opts.update == 'always') {
      yield compile(src, cache)
    } else {
      try {
        yield fsp.access(cache, fsp.F_OK)
      } catch (err) {
        if (opts.update == 'never') {
          log.error('No compiled file found')
          return
        }
        yield compile(src, cache)
      }
    }

    serve(res, cache, opts.maxAge)
  })
}
