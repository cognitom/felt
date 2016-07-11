'use strict'

const spawn = require('child_process').spawn

const
  eraseLine = '\x1b[2K',
  goToStartOfLine = '\x1b[G'

module.exports = function(pkgName, globalFlag) {
  return new Promise((resolve, reject) => {
    let counter = 0
    const
      cmnd = 'npm',
      args = ['install', pkgName].concat(globalFlag ? ['--global'] : []),
      npm = spawn(cmnd, args),
      timer = setInterval(() => {
        const line = '#'.repeat(counter++ % process.stdout.columns)
        process.stdout.write(eraseLine + line + goToStartOfLine)
      }, 100)

    // npm.stdout.pipe(process.stdout)
    npm.on('close', code => {
      if (code != 0)
        return reject(new Error(`Installation failed: ${ pkgName }`))
      clearInterval(timer)
      process.stdout.write(eraseLine + goToStartOfLine)
      resolve()
    })
  })
}
