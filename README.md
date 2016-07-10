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
  felt = require('felt')

const app = express()

app.use(felt('public'))
app.use(express.static('public'))
app.listen(3000)
```

CLI mode will come soon, too.

## Configuration

Felt could have one argument for options:

```javascript
const
  express = require('express'),
  felt = require('felt'),
  rollup = require('felt-rollup'),
  postcss = require('felt-postcss')

const app = express()

app.use(felt({
  src: 'public'
  cache: 'cache',
  compilers: {
    '**/*.js': rollup('rollup.config.js'),
    '**/*.css': postcss('postcss.config.js')
  }
}))
app.use(express.static('public'))
app.listen(3000)
```

property | default | other options
:-- | :-- | :--
**opts.src** | (not set) | the document directory to serve
**opts.cache** | `'cache'` | as you like but don't make it inside `src`
**opts.root** | `process.cwd()` | as you like
**opts.update** | `'once'` | `'never'` or `'allways'`
**opts.refresh** | `true` | set `false` to skip refreshing on starting
**opts.watch** | `false` | set `true` to detect changes
**opts.maxAge** | `0` |
**opts.compilers** | rollup and postcss | see the section below
**opts.debug** | `false` | set `true` to show debug comments on the terminal

### opts.compilers

The keys of the object are globs. This example reads `rollup.config.js` for `rollup`:

```javascript
{
  '*.js': rollup('rollup.config.js')
}
```

Or the config could be inline:

```javascript
{
  '*.js': rollup({
    plugins: [
      resolve({ jsnext: true }),
      commonjs(),
      buble()
    ],
    sourceMap: true
  })
}
```

## Plugins

- `felt-rollup`: JavaScript bundler (included)
- `felt-postcss`: CSS bundler (included)

## Todos

There're some under-developing features.

### CLI standalone server

Install felt globally:

```bash
$ npm install -g felt
```

Specify the document directory:

```bash
$ cd path/to/root
$ felt public
```

Or choose your config file:

```bash
$ felt -c
```

This is the same as below:

```bash
$ felt -c felt.config.js
```

The config file could be like this:

```javascript
const
  rollup = require('felt-rollup'),
  postcss = require('felt-postcss')

module.exports = {
  src: 'public',
  cache: 'cache',
  compilers: {
    '**/*.js': rollup(),
    '**/*.css': postcss()
  }
}
```

### Static site exporter

This is handy to upload the contents to amazon S3 or GitHub Pages.

```bash
$ cd path/to/root
$ felt public -e dist
```
