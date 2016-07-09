# Felt

## Installation

```bash
$ npm install -g felt
```

## Usage

Use Felt as a standalone CLI program.

```bash
$ cd path/to/dir
$ felt
```

Or, use it as an `express` plugin.

```javascript
const
  express = require('express'),
  felt = require('felt')

const app = express()

app.use(felt('public'))
app.use(express.static('public'))
app.listen(3000)

```

## Configuration

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

## Plugins

- `felt-rollup`: JavaScript bundler (included)
- `felt-postcss`: CSS bundler (included)
