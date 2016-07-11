'use strict'

const
  requestOriginal = require('request'),
  promisify = require('tiny-promisify')

const request = promisify(requestOriginal)

module.exports = function (pkgName) {
  const url = 'https://www.npmjs.org/package/' + pkgName
  return request(url).then(response => response.statusCode == 200)
}
