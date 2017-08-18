#! /usr/bin/env node
const cp = require('child_process')
const fs = require('fs')
const path = require('path')
const copyFiles = require('./copyFiles')

const root = path.resolve(__dirname, '../')

copyFiles(root + '/public', root + '/build')

// @see https://strongloop.com/strongblog/modular-node-js-express/
// get library path

const src = root + '/src'
fs.readdirSync(src)
  .forEach((app) => {
        var appPath = path.join(src, app)

        // ensure path has package.json
        if (!fs.existsSync(path.join(appPath, 'package.json'))) return

        console.log('START: '+appPath)

        // install folder
        cp.spawn('npm', ['run', 'start'], {
            env: process.env,
            cwd: appPath,
            stdio: 'inherit'
        })
    })

// cp.spawn('npm', ['run', 'start'], {
//   env: process.env,
//   cwd: root,
//   stdio: 'inherit'
// })
