'use strict'

import test from 'ava'
import del from 'del'
import path from 'path'
import fsp from 'fs-promise'
import configBuilder from '../lib/config-builder'
import mkdirs from '../lib/mkdirs'
import npmExists from '../lib/npm-exists'
import server from '../lib/server'

test('builds basic opts from configs', function(t) {
  const
    config = { src: 'public' },
    opts = configBuilder(config)

  t.is(opts.cache, 'cache')
  t.is(opts.root, process.cwd())
  t.is(opts.update, 'once')
  t.false(opts.watch)
  t.is(opts.maxAge, 0)
  t.false(opts.debug)
})

test('generates patterns from handlers if not exists', function(t) {
  const
    obj0 = {},
    obj1 = {},
    cssDummyHandler = () => obj0,
    jsDummyHandler = () => obj1,
    config = {
      src: 'public',
      handlers: {
        '.css': cssDummyHandler(),
        '.js': jsDummyHandler()
      }
    },
    opts = configBuilder(config)

  t.is(opts.patterns[0].pattern, '**/*.css')
  t.is(opts.patterns[0].handler, obj0)
  t.is(opts.patterns[1].pattern, '**/*.js')
  t.is(opts.patterns[1].handler, obj1)
})

test('composes multiple configs', function(t) {
  const
    config0 = { watch: true },
    config1 = { src: 'public' },
    config2 = { src: 'other' }, // overwrite src
    opts = configBuilder(config0, config1, config2)

  t.true(opts.watch)
  t.is(opts.src, 'other')
})

test('makes dir at empty', async function(t) {
  const dir = path.join(__dirname, 'mkdirs-test')

  await mkdirs(dir)

  let dirCreated = false
  try {
    const stats = await fsp.stat(dir)
    if (stats.isDirectory()) dirCreated = true
  } catch (err) { /* */ }

  t.true(dirCreated)

  await del(dir)
})

test('makes dir but already file exists', async function(t) {
  const dir = path.join(__dirname, 'mkdirs-test2')

  await fsp.writeFile(dir, 'Hi!')
  await mkdirs(dir)

  let dirCreated = false
  try {
    const stats = await fsp.stat(dir)
    if (stats.isDirectory()) dirCreated = true
  } catch (err) { /* */ }

  t.true(dirCreated)

  await del(dir)
})

test('checks npm-exists', async function(t) {
  const
    minimalIsExists = await npmExists('felt-recipe-minimal'),
    maximalIsNotExists = await npmExists('felt-recipe-maximal')

  t.true(minimalIsExists)
  t.false(maximalIsNotExists)
})
