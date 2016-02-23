#!/usr/bin/env node

/*
 * Project: appversion
 * Version: 1.2.0
 * Author: delvedor
 * Twitter: @delvedor
 * License: GNU GPLv2
 * GitHub: https://github.com/delvedor/appversion
 */

'use strict'
const fs = require('fs')
const resolve = require('path').resolve
const exec = require('child_process').exec
const walk = require('walk')
const appversion = require('commander')
const check = require('type-check').typeCheck
const helpDocs = `  Semantic Versioning: http://semver.org
  Appversion documentation: https://github.com/delvedor/appversion`

// Filenames
const JSON_FILE = 'appversion.json'
const JSON_FILE_DEFAULT = resolve(__dirname, 'appversion.default.json')

appversion
  .version('1.2.0')
  .usage('<option> <param>')
  .option('update <param>', 'Updates the <param> that can be major|minor|patch|build|commit', update)
  .option('set-version <param>', 'Sets a specific version number, the <param> must be x.y.z', setVersion)
  .option('set-status <param>', 'Sets a specific status, the <param> stage can be stable|rc|beta|alpha and the number must be a number', setStatus)
  .option('init', 'Generates the appversion.json file', init)

appversion.on('--help', () => {
  console.log(helpDocs)
})

appversion.on('help', () => {
  console.log(helpDocs)
})

appversion.parse(process.argv)
if (process.argv.length <= 2) appversion.help()

function update (param) {
  if (!check('String', param)) return
  if (param === 'major' || param === 'minor' || param === 'patch') {
    updateVersion(param)
  } else if (param === 'build') {
    updateBuild()
  } else if (param === 'commit') {
    updateCommit()
  } else {
    console.log('Error')
  }
}

function updateVersion (param) {
  let obj = getJsonObj(JSON_FILE)
  obj.version[param]++
  if (param === 'major') obj.version.minor = obj.version.patch = 0
  if (param === 'minor') obj.version.patch = 0
  obj.build.number = 0
  writeJson(obj, `Version updated to ${obj.version.major}.${obj.version.minor}.${obj.version.patch}\n`)
  writeOtherJson(`${obj.version.major}.${obj.version.minor}.${obj.version.patch}`)
}

function updateBuild () {
  let obj = getJsonObj(JSON_FILE)
  let date = (new Date()).toString()
  obj.build.date = date
  obj.build.number++
  obj.build.total++
  writeJson(obj, `Build updated to ${obj.build.number}/${obj.build.total}\n`)
}

function updateCommit () {
  let obj = getJsonObj(JSON_FILE)
  exec('git log --oneline', function (error, stdout) {
    if (error) {
      obj.commit = null
      writeJson(obj, 'No Git repository found.\n')
    } else {
      obj.commit = stdout.substring(0, 7)
      writeJson(obj, `Commit updated to ${stdout.substring(0, 7)}\n`)
    }
  })
}

function setVersion (param) {
  if (!check('String', param)) return
  let obj = getJsonObj(JSON_FILE)
  let version = param.split('.')
  if (version.length !== 3) {
    console.log('Insert a valid version number formatted in this way: "x.y.z"\n')
    return
  }
  version[0] = Number(version[0])
  version[1] = Number(version[1])
  version[2] = Number(version[2])
  if (!check('Number', version[0]) || !check('Number', version[1]) || !check('Number', version[2])) {
    console.log('The major, minor and patch values must be Numbers\n')
    return
  }
  obj.version.major = version[0]
  obj.version.minor = version[1]
  obj.version.patch = version[2]
  obj.build.number = 0
  writeJson(obj, `Version changed to ${version[0]}.${version[1]}.${version[2]}\n`)
  writeOtherJson(`${version[0]}.${version[1]}.${version[2]}`)
}

function setStatus (param) {
  if (!check('String', param)) return
  let obj = getJsonObj(JSON_FILE)
  let status = param.split('.')
  if (status[1]) {
    status[1] = Number(status[1])
    if (!check('Number', status[1])) {
      console.log('Insert a valid status.number number')
      return
    }
  }
  if (status[0] !== 'stable' && status[0] !== 'rc' && status[0] !== 'beta' && status[0] !== 'alpha') {
    console.log('Insert a valid status.stage string')
    return
  }
  obj.status.stage = status[0]
  obj.status.number = status[1] || 0
  writeJson(obj, `Status updated to ${status[0]}.${status[1] || 0}\n`)
}

function init () {
  let obj = getJsonObj(JSON_FILE_DEFAULT)
  try {
    let fd = fs.openSync(('./' + JSON_FILE), 'wx+')
    let json = `${JSON.stringify(obj, null, 2)}\n`
    fs.writeFileSync(JSON_FILE, json)
    fs.closeSync(fd)
  } catch (err) {
    throw new Error(err)
  }
}

function getJsonObj (file) {
  if (!check('String', file)) return
  try {
    return JSON.parse(fs.readFileSync(file))
  } catch (err) {
    throw new Error(err)
  }
}

function writeJson (obj, message) {
  if (!check('Object', obj) || !check('String | Undefined', message)) return
  let json = `${JSON.stringify(obj, null, 2)}\n`
  try {
    fs.writeFileSync(JSON_FILE, json)
    if (message) console.log(message)
  } catch (err) {
    throw new Error(err)
  }
}

function writeOtherJson (version) {
  if (!check('String', version)) return
  let obj = getJsonObj(JSON_FILE)
  obj.ignore.push('node_modules', 'bower_components', '.git')
  obj.json.push('package.json', 'bower.json')

  let walker = walk.walk(__dirname, {followLinks: false, filters: obj.ignore})

  walker.on('file', function (root, fileStats, next) {
    if (obj.json.indexOf(fileStats.name) > -1) {
      let fileObj
      try {
        fileObj = JSON.parse(fs.readFileSync(resolve(root, fileStats.name)))
      } catch (err) {
        return
      }
      fileObj.version = version
      let json = `${JSON.stringify(fileObj, null, 2)}\n`
      fs.writeFileSync(resolve(root, fileStats.name), json)
    }
    next()
  })
}
