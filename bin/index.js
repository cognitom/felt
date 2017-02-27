#!/usr/bin/env node
'use strict'
const
  co = require('co'),
  meow = require('meow'),
  fsp = require('fs-promise'),
  path = require('path'),
  server = require('../lib/server'),
  staticExport = require('../lib/static-export'),
  configBuilder = require('../lib/config-builder')

co(function* () {
  let recipe = {}, config = {}, flavor = { port: 3000 }
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
        p: 'port',
        e: 'export'
      },
      string: ['recipe', 'config', 'src', 'cache', 'root', 'port', 'export', 'update'],
      boolean: ['refresh', 'no-refresh', 'watch', 'no-watch', 'debug']
    }),
    flags = cli.flags

  if (!flags.recipe && !flags.config && flags.config !== '') flags.recipe = 'minimal'

  if (flags.recipe) {
    const pkgName = 'felt-recipe-' + flags.recipe
    try {
      recipe = require(pkgName)
    } catch(err) {
      throw new Error(`${ pkgName } is not installed`)
    }
  }

  if (flags.config !== undefined) {
    try {
      const configFile = path.resolve(root, flags.config || 'felt.config.js')
      config = require(configFile)
    } catch(err) {
      throw new Error('No valid config file')
    }
  }

  if (flags.src) flavor.src = flags.src
  if (flags.cache) flavor.cache = flags.cache
  if (flags.root) flavor.root = flags.root
  if (flags.update) flavor.update = flags.update
  if (flags.refresh) flavor.refresh = true
  if (flags.noRefresh) flavor.refresh = false
  if (flags.watch) flavor.watch = true
  if (flags.noWatch) flavor.watch = false
  if (flags.debug) flavor.debug = true
  if (flags.port) flavor.port = parseInt(flags.port)
  if (flags.export) flavor.cache = flags.export

  const opts = configBuilder(recipe, config, flavor)

  if (flags.export) staticExport(opts)
  else server(opts)
})
