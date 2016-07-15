![Felt](doc/logo.png)

On-demand bundler for ES6 / CSS Next.

- [Use Felt as a webserver via CLI](#cli-usages)
- [Use Felt as a middleware of Express](#with-express)

See also its [options](#options), [plugins](#plugins) and [recipes](#recipes).

## CLI usages

In short, install felt globally:

```bash
$ npm install -g felt
```

And run Felt:

```bash
$ cd path/to/project/
$ felt
```

### Run Felt

Assume that you have a project like this:

- project/
  - public/
    - index.html
    - main.js
    - style.css
  - cache/
  - package.json

Install a [recipe](#recipes) from npm:

```bash
$ npm install -g felt-recipe-minimal
```

Then run Felt:

```bash
$ cd path/to/project/
$ felt --recipe minimal --src public
```

There're some [official recipes](#secipes). Check them, too.

### Use config files

Assume that you have a project like this:

- project/
  - public/
    - index.html
    - main.js
    - style.css
  - cache/
  - package.json
  - felt.config.js

Or choose your own config file:

```bash
$ felt --config felt.config.js
```

The default name of `config` is `felt.config.js`, so it's also fine:

```bash
$ felt --config
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
  }
}
```

See more detail about [options](#options)

### Watch changes

```bash
$ felt -src public --watch
```

### Export static files

This is handy to upload the contents to amazon S3 or GitHub Pages. Felt exports not only compiled files but also other assets like HTML, PNG, ...etc, too.

```bash
$ felt --src public --export dist
```

## With Express

Install Felt and use it as an `express` middleware.

```bash
$ npm install --save felt
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

### Separated config files

It's a good idea to separate the config from `server.js`:

```javascript
const
  express = require('express'),
  felt = require('felt')
  config = require('./felt.config.js')

app.use(felt(config))
app.use(express.static('public'))
app.listen(3000)
```

`felt.config.js` could be like this:

```javascript
const
  rollup = require('felt-rollup'),
  buble = require('rollup-plugin-buble'),
  resolve = require('rollup-plugin-node-resolve'),
  commonjs = require('rollup-plugin-commonjs')

module.exports = {/* options */}
```


## Options

property | default | descriptions
:-- | :-- | :--
**opts.src** | `.` | the document directory to serve
**opts.cache** | `'cache'` | don't make it inside `src`
**opts.root** | `process.cwd()` | usually no need to set it
**opts.handlers** | `{}` | see the section below
**opts.patterns** | `[]` | see the section below
**opts.update** | `'once'` | `'never'` or `'allways'`
**opts.refresh** | `true` | set `false` to skip refreshing on starting
**opts.watch** | `false` | set `true` to detect changes
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

Plugins are the interface to compilers like Rollup or PostCSS. Actually these are the thin wrapper of these libraries:

- [felt-rollup](https://github.com/cognitom/felt-rollup): JavaScript bundler
- [felt-postcss](https://github.com/cognitom/felt-postcss): CSS bundler

## Recipes

Recipes are pre-made configurations. You can use these recipe with some overwrite with ease.

- [felt-recipe-minimal](https://github.com/cognitom/felt-recipe-minimal): PostCSS and Rollup with Bublé
- [felt-recipe-standard](https://github.com/cognitom/felt-recipe-standard): PostCSS and Rollup with Babel


## License

MIT © Tsutomu Kawamura
