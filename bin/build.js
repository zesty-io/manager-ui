#! /usr/bin/env node
const cp = require('child_process')
const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '../')

const copyFiles = (from, to) => {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to)
  }
  fs.readdir(from, (err, files) => {
    if (!err) {
      files.forEach(file => {
        const is = fs.createReadStream(from + '/' + file)
        const os = fs.createWriteStream(to + '/' + file)
        is.pipe(os)
      })
    } else {
      throw err
    }
  })
}

// @see https://strongloop.com/strongblog/modular-node-js-express/
// get library path

const src = root + '/src'
fs.readdirSync(src)
  .forEach((app) => {
        var appPath = path.join(src, app)

        // ensure path has package.json
        if (!fs.existsSync(path.join(appPath, 'package.json'))) return

        // install folder
        cp.spawn('npm', ['run', 'build'], {
            env: process.env,
            cwd: appPath,
            stdio: 'inherit'
        })
    })

copyFiles(root + '/public', root + '/build')

cp.spawn('npm', ['run', 'build:prod'], {
  env: process.env,
  cwd: root,
  stdio: 'inherit'
})
