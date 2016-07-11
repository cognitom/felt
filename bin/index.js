#!/usr/bin/env node
'use strict'
const
  co = require('co'),
  meow = require('meow'),
  fsp = require('fs-promise'),
  path = require('path'),
  server = require('../lib/server'),
  npmExists = require('../lib/npm-exists'),
  npmInstall = require('../lib/npm-install')

co(function* () {
  const
    root = process.cwd(),
    helpFile = path.join(__dirname, 'help.txt'),
    helpText = yield fsp.readFile(helpFile, 'utf8'),
    cli = meow(helpText, {
      alias: {
        r: 'recipe',
        c: 'config',
        s: 'src',
        u: 'update',
        w: 'watch',
        p: 'port'
      },
      string: ['recipe', 'config', 'src', 'cache', 'root', 'port'],
      boolean: ['update', 'refresh', 'no-refresh', 'watch', 'no-watch', 'debug']
    }),
    flags = cli.flags,
    opts = { port: 3000 }

  if (!flags.recipe && !flags.config) flags.recipe = 'minimal'

  if (flags.recipe) {
    const pkgName = 'felt-recipe-' + flags.recipe
    try {
      const recipe = require(pkgName)
      Object.assign(opts, recipe)
    } catch(err) {
      try {
        if (yield npmExists(pkgName)) {
          try {
            yield fsp.access(path.join(root, 'node_modules'), fsp.F_OK)
            yield npmInstall(pkgName, false)
            console.log(`Recipe installed locally: ${ pkgName }`)
          } catch (err) {
            yield npmInstall(pkgName, true)
            console.log(`Recipe installed globally: ${ pkgName }`)
          }
          const recipe = require(pkgName)
          Object.assign(opts, recipe)
        }
      } catch(err) {
        throw new Error('No valid recipe')
      }
    }
  }

  if (flags.config) {
    try {
      const
        configFile = path.resolve(root, flags.config),
        config = require(configFile)

      Object.assign(opts, config)
    } catch(err) {
      throw new Error('No valid config file')
    }
  }

  if (flags.src) opts.src = flags.src
  if (flags.cache) opts.cache = flags.cache
  if (flags.root) opts.root = flags.root
  if (flags.update) opts.update = flags.update
  if (flags.refresh) opts.refresh = true
  if (flags.noRefresh) opts.refresh = false
  if (flags.watch) opts.watch = true
  if (flags.noWatch) opts.watch = false
  if (flags.debug) opts.debug = true
  if (flags.port) opts.port = parseInt(flags.port)

  server(opts)
})
