# Felt

## Usage

Install Felt and use it as an `express` middleware.

```bash
$ npm install felt
```

Add `server.js` to the project:

```javascript
const
  express = require('express'),
  felt = require('felt'),
  recipe = require('felt-recipe-minimal')

const app = express()

app.use(felt(recipe, { src: 'public' }))
app.use(express.static('public'))
app.listen(3000)
```

CLI mode will come soon, too.

## Options

```javascript
const
  express = require('express'),
  felt = require('felt'),
  rollup = require('felt-rollup'),
  buble = require('rollup-plugin-buble'),
  resolve = require('rollup-plugin-node-resolve'),
  commonjs = require('rollup-plugin-commonjs')

const
  app = express(),
  config = {
    src: 'public',
    handlers: {
      '.js': rollup({
        plugins: [
          resolve({ jsnext: true,  main: true, browser: true }),
          commonjs(),
          buble()
        ],
        sourceMap: true
      })
    },
    patterns: ['*.js', '*.css'],
    watch: true
  }

app.use(felt(config))
app.use(express.static('public'))
app.listen(3000)
```

property | default | other options
:-- | :-- | :--
**opts.src** | (not set) | the document directory to serve
**opts.cache** | `'cache'` | don't make it inside `src`
**opts.root** | `process.cwd()` | usually no need to set it
**opts.handlers** | `{}` | see the section below
**opts.patterns** | `[]` | see the section below
**opts.update** | `'once'` | `'never'` or `'allways'`
**opts.refresh** | `true` | set `false` to skip refreshing on starting
**opts.watch** | `false` | set `true` to detect changes
**opts.maxAge** | `0` |
**opts.debug** | `false` | set `true` to show debug comments on the terminal

### opts.handlers

Default handlers for each extensions.

```javascript
{
  hendlers: {
    '*.js': rollup({
      plugins: [
        resolve({ jsnext: true }),
        commonjs(),
        buble()
      ],
      sourceMap: true
    })
  }
}
```

### opts.patterns

This option limits the target which Felt works with. This is handy when you want to use Felt for only a few files like this:

```javascript
{
  patterns: ['index.js', 'components/*.js']
}
```

Which handler will be used is depends on the extension. If no handler for the extension, Felt will throw exceptions.

You can also specify the custom handler for the pattern:

```javascript
{
  patterns: [
    'index.js',
    {
      pattern: 'components/*.js',
      handler: rollup({
        plugins: [babel()],
        sourceMap: true
      })
    }
  ]
}
```

## Plugins

- [felt-rollup](https://github.com/cognitom/felt-rollup): JavaScript bundler
- [felt-postcss](https://github.com/cognitom/felt-postcss): CSS bundler

## Recipes

Recipes are pre-made configurations. You can use these recipe with some overwrite with ease.

- [felt-recipe-minimal](https://github.com/cognitom/felt-recipe-minimal): PostCSS and Rollup with Bublé
- [felt-recipe-standard](https://github.com/cognitom/felt-recipe-standard): PostCSS and Rollup with Babel

## Todos

There're some under-developing features.

### CLI standalone server

Install felt globally:

```bash
$ npm install -g felt
```

Choose recipe and overwrite some options:

```bash
$ cd path/to/root
$ felt --recipe minimal --src public
```

Or choose your own config file:

```bash
$ felt --config
```

This is the same as below:

```bash
$ felt --config felt.config.js
```

The config file could be like this:

```javascript
'use strict'
const
  rollup = require('felt-rollup'),
  buble = require('rollup-plugin-buble'),
  resolve = require('rollup-plugin-node-resolve'),
  commonjs = require('rollup-plugin-commonjs')

module.exports = {
  src: 'public',
  handlers: {
    '.js': rollup({
      plugins: [
        resolve({ jsnext: true,  main: true, browser: true }),
        commonjs(),
        buble()
      ],
      sourceMap: true
    })
  },
  patterns: ['*.js'],
  watch: true
}
```

### Static site exporter

This is handy to upload the contents to amazon S3 or GitHub Pages.

```bash
$ cd path/to/root
$ felt public -e dist
```
