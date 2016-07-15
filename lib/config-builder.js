'use strict'

/** default values */
const defaults = {
  src: null,
  cache: 'cache',
  root: process.cwd(),
  handlers: {}, // default handlers for each extension
  patterns: [], // array of globs to handle
  update: 'once', // 'never', 'once' or 'allways'
  refresh: true, // refresh on starting
  watch: false,
  maxAge: 0,
  debug: false
}

module.exports = function(...configs) {
  const opts = Object.assign({}, defaults)

  // composition of recipes, configs and overwrites
  for (const config of configs) {
    config.handlers = Object.assign(opts.handlers, config.handlers || {})
    Object.assign(opts, config)
  }

  // some checks and modifications
  if (!opts.src) throw new Error('Felt needs src directory. Ex: "public"')
  if (!opts.patterns.length) {
    opts.patterns = Object.keys(opts.handlers).map(ext => `**/*${ ext }`)
  }

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
