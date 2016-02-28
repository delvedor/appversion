#!/usr/bin/env node

/*
 * Project: appversion
 * Version: 1.2.1
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
  AppVersion documentation: https://github.com/delvedor/appversion`
const apvVersion = '1.2.1'

// Filenames
const JSON_FILE = 'appversion.json'
const JSON_FILE_DEFAULT = resolve(__dirname, 'appversion.default.json')

// commands arguments
appversion
  .version(apvVersion)
  .usage('<option> <param>')
  .option('update <param>', 'Updates the <param> that can be major|minor|patch|build|commit', update)
  .option('set-version <param>', 'Sets a specific version number, the <param> must be x.y.z', setVersion)
  .option('set-status <param>', 'Sets a specific status, the <param> stage can be stable|rc|beta|alpha and the number must be a number', setStatus)
  .option('init', 'Generates the appversion.json file', init)

// Custom docs
appversion.on('--help', () => {
  console.log(helpDocs)
})

appversion.on('help', () => {
  console.log(helpDocs)
})

appversion.parse(process.argv)
// Calls help() if there are no parameters
if (process.argv.length <= 2) appversion.help()

/**
 * Calls the correct update function based on the parameter.
 */
function update (param) {
  if (!check('String', param)) return
  if (param === 'major' || param === 'minor' || param === 'patch') {
    updateVersion(param)
  } else if (param === 'build') {
    updateBuild()
  } else if (param === 'commit') {
    updateCommit()
  } else {
    console.log('Error, type apv help to get more informations!\n')
  }
}

/**
 * Increase the major|minor|patch version number.
 * @param  {String} version [major|minor|patch]
 */
function updateVersion (param) {
  let obj = getJsonObj(JSON_FILE)
  obj.version[param]++
  if (param === 'major') obj.version.minor = obj.version.patch = 0
  if (param === 'minor') obj.version.patch = 0
  // The build number is reset whenever we update the version number
  obj.build.number = 0
  writeJson(obj, `Version updated to ${obj.version.major}.${obj.version.minor}.${obj.version.patch}\n`)
  writeOtherJson(`${obj.version.major}.${obj.version.minor}.${obj.version.patch}`)
}

/**
 * Increase the build number and updates the date.
 */
function updateBuild () {
  let obj = getJsonObj(JSON_FILE)
  // The date is a string representing the Date object
  let date = (new Date()).toString()
  obj.build.date = date
  obj.build.number++
  obj.build.total++
  writeJson(obj, `Build updated to ${obj.build.number}/${obj.build.total}\n`)
}

/**
 * Updates the commit code.
 */
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

/**
 * Sets a specific version number.
 * @param {String} newVersion [version number "x.y.z"]
 */
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
  writeJson(obj, `Version updated to ${version[0]}.${version[1]}.${version[2]}\n`)
  writeOtherJson(`${version[0]}.${version[1]}.${version[2]}`)
}

/**
 * Sets a specific status.
 * @param {String} newStatus [status string "stable|rc|beta|alpha"]
 */
function setStatus (param) {
  if (!check('String', param)) return
  let obj = getJsonObj(JSON_FILE)
  let status = param.split('.')
  if (status[1]) {
    status[1] = Number(status[1])
    if (!check('Number', status[1])) {
      console.log('Insert a valid status.number number\n')
      return
    }
  }
  let match = ['Stable', 'stable', 'RC', 'rc', 'Beta', 'beta', 'Alpha', 'alpha']
  if (match.indexOf(status[0]) === -1) {
    console.log('Insert a valid status.stage string\n')
    return
  }
  obj.status.stage = status[0]
  // if there's not the status number, it's setted to zero
  obj.status.number = status[1] || 0
  writeJson(obj, `Status updated to ${status[0]}.${status[1] || 0}\n`)
}

/**
 * Creates the appversion file from the default file (one time use).
 */
function init () {
  let obj = getJsonObj(JSON_FILE_DEFAULT)
  try {
    let fd = fs.openSync(('./' + JSON_FILE), 'wx+')
    let json = `${JSON.stringify(obj, null, 2)}\n`
    fs.writeFileSync(JSON_FILE, json)
    fs.closeSync(fd)
    console.log('appversion.json created, type apv help to get more informations!\n')
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.log('appversion.json already exists, type apv help to get more informations!\n')
      return
    }
    throw new Error(err)
  }
}

/**
 * Returns the appversion json content.
 * @param  {String} filename [name of the json]
 * @return {Object}          [content of the json]
 */
function getJsonObj (file) {
  if (!check('String', file)) return
  try {
    let obj = JSON.parse(fs.readFileSync(file))
    // checks if the appversion.json is at the latest version
    if (file === JSON_FILE && (!obj.appversion || obj.appversion !== apvVersion)) obj = updateAppversion(obj)
    return obj
  } catch (err) {
    throw new Error(err)
  }
}

/**
 * Wrote into the json the object passed as argument
 * @param  {Object} obj [Full object]
 * @param  {String} message [Optional message]
 */
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

/**
 * Extension of the above function.
 * Updates package.json, bower.json and all other json in appversion.json
 * @param  {String} version   [version number x.y.z]
 */
function writeOtherJson (version) {
  if (!check('String', version)) return
  let obj = getJsonObj(JSON_FILE)
  // ignore every subfolder in the project
  if (obj.ignore.indexOf('*') > -1) return
  // default ignored subfolders
  obj.ignore.push('node_modules', 'bower_components', '.git')
  // default json files
  obj.json.push('package.json', 'bower.json')

  let walker = walk.walk(resolve('./'), {followLinks: false, filters: obj.ignore})

  walker.on('file', function (root, fileStats, next) {
    // if the filename is inside the appversion's json array
    if (obj.json.indexOf(fileStats.name) > -1) {
      let fileObj
      try {
        fileObj = JSON.parse(fs.readFileSync(resolve(root, fileStats.name)))
      } catch (err) {
        return
      }
      // If the "version" field is not present in the json file we add it
      fileObj.version = version
      let json = `${JSON.stringify(fileObj, null, 2)}\n`
      fs.writeFileSync(resolve(root, fileStats.name), json)
    }
    next()
  })
}

/**
 * This function updates the appversion.json to the latest appversion json structure.
 * @param  {Object} obj [actual appversion object]
 * @return {Object}     [correct appversion object]
 */
function updateAppversion (obj) {
  if (!check('Object', obj)) return
  // if the "ignore" filed is not present in the json we add it
  if (!obj.ignore) obj.ignore = []
  // if the "package.json" and "bower.json" are present in the "json" array field, we remove them
  if (obj.json.indexOf('package.json') > -1) obj.json.splice(obj.json.indexOf('package.json'), 1)
  if (obj.json.indexOf('bower.json') > -1) obj.json.splice(obj.json.indexOf('bower.json'), 1)
  // updates the appversion.json version number
  obj.appversion = apvVersion
  console.log('appversion.json updated to the latest version.')
  return obj
}
