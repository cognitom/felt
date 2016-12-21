'use strict'

import test from 'ava'
import del from 'del'
import path from 'path'
import fsp from 'fs-promise'
import requestOriginal from 'request'
import promisify from 'tiny-promisify'
import recipeMinimal from 'felt-recipe-minimal'
import configBuilder from '../lib/config-builder'
import mkdirs from '../lib/mkdirs'
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

test('cache and src is the same', function(t) {
  try {
    const
      config = { src: 'public', cache: 'public' },
      opts = configBuilder(config)

    t.fail()
  } catch (err) {
    t.pass()
  }
})

test('src is inside of cache', function(t) {
  try {
    const
      config = { src: 'cache/a', cache: 'cache' },
      opts = configBuilder(config)

    t.fail()
  } catch (err) {
    t.pass()
  }
})

test('cache is inside of src', function(t) {
  const
    config = { src: 'public', cache: 'public/cache' },
    opts = configBuilder(config)

  t.truthy(~opts.excludes.indexOf('cache/**'))
})

test('src is dot(.)', function(t) {
  const
    config = { src: '.', cache: 'cache' },
    opts = configBuilder(config)

  t.truthy(~opts.excludes.indexOf('cache/**'))
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

test('bundles scripts', async function(t) {
  const
    port = 3333,
    opts = configBuilder(recipeMinimal, { src: 'fixture', port }),
    url = `http://localhost:${ port }/a.js`,
    myServer = await server(opts),
    actual = await request(url),
    expected = await readFile('expect/a.js')

  t.is(actual, expected)
  myServer.close()
})

test('serves static contents', async function(t) {
  const
    port = 3334,
    opts = configBuilder(recipeMinimal, { src: 'fixture', port }),
    url = `http://localhost:${ port }/index.html`,
    myServer = await server(opts),
    actual = await request(url),
    expected = await readFile('expect/index.html')

  t.is(actual, expected)
  myServer.close()
})

test('serves refs', async function(t) {
  const
    port = 3335,
    opts = configBuilder(recipeMinimal, {
      src: 'fixture',
      port,
      external: {
        'my-ref.js': 'deeper/ref.js'
      }
    }),
    url = `http://localhost:${ port }/my-ref.js`,
    myServer = await server(opts),
    actual = await request(url),
    expected = 'Hi!'

  t.is(actual, expected)
  myServer.close()
})

function removeLastNewLine(str) {
  return str.replace(/\n$/, '')
}

async function readFile(file) {
  const content = await fsp.readFile(file, 'utf8')
  return removeLastNewLine(content)
}

async function request(url) {
  const response = await promisify(requestOriginal)(url)
  return removeLastNewLine(response.body)
}
