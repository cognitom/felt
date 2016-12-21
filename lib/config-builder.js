'use strict'

const path = require('path')

/** default values */
const defaults = {
  src: '.',
  cache: 'cache',
  root: process.cwd(),
  handlers: {}, // default handlers for each extension
  patterns: [], // array of globs to handle
  external: {},
  update: 'once', // 'never', 'once' or 'always'
  refresh: true, // refresh on starting
  watch: false,
  maxAge: 0,
  debug: false,
  excludes: ['node_modules/**']
}

module.exports = function(...configs) {
  const opts = Object.assign({}, defaults)

  // composition of recipes, configs and overwrites
  for (const config of configs) {
    config.handlers = Object.assign(opts.handlers, config.handlers || {})
    config.external = Object.assign(opts.external, config.external || {})
    config.excludes = opts.excludes.concat(config.excludes || [])
    Object.assign(opts, config)
  }

  // some checks and modifications
  if (opts.src == opts.cache || isInsideDir(opts.src, opts.cache))
    throw new Error('The src directory needs to be outside the cache')
  const cacheFromSrc = isInsideDir(opts.cache, opts.src)
  if (cacheFromSrc) opts.excludes.push(`${ cacheFromSrc }/**`)
  if (!opts.patterns.length)
    opts.patterns = Object.keys(opts.handlers).map(ext => `**/*${ ext }`)

  // wires up the patterns and handlers
  opts.patterns = opts.patterns.map(entry => {
    if (typeof entry == 'string') entry = { pattern: entry }
    if (!entry.pattern) throw new Error('No pattern')
    if (entry.handler) return entry
    for (const ext in opts.handlers)
      if (new RegExp(`\\${ ext }$`).test(entry.pattern))
        return Object.assign(entry, { handler: opts.handlers[ext] })
    throw new Error(`No handler registered: ${ entry.pattern }`)
  })

  return opts
}

/**
 * If dir is inside targetDir, return the relative path
 * If else, return false
 */
function isInsideDir(dir, targetDir) {
  if (targetDir == dir) return false
  if (targetDir == '.') return dir
  const relative = path.relative(targetDir, dir)
  if (/^\.\./.test(relative)) return false
  return relative
}
