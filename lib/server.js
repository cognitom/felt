'use strict'

const
  co = require('co'),
  express = require('express'),
  path = require('path'),
  felt = require('../')

module.exports = function (opts) {
  const app = express()

  app.use(felt(opts))
  app.use(express.static(opts.src))
  app.listen(opts.port)
}
