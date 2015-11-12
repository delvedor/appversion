#!/usr/bin/env node

/*
 * Project: appversion
 * Version: 1.1.0
 * Author: delvedor
 * Twitter: @delvedor
 * License: GNU GPLv2
 * GitHub: https://github.com/delvedor/appversion
 */

import { readFileSync, writeFileSync, openSync, closeSync } from 'fs'
import { resolve } from 'path'
import { exec } from 'child_process'
import walk from 'walk'

// Filenames
const JSON_FILE = 'appversion.json'
const JSON_FILE_DEFAULT = `${__dirname}/appversion.default.json`

/**
 * Gets the input from the console and calls the correct function.
 */
;(function () {
  let arg
  let param
  let ignore
  if (process.argv.length === 2) printHelp()
  for (let i = 2; i < process.argv.length; i++) {
    arg = process.argv[i]
    param = process.argv[i + 1]
    ignore = process.argv[i + 2] || null
    // Update
    if (arg === 'update') {
      i = ignore ? i + 2 : i + 1
      if (param === 'major' || param === 'minor' || param === 'patch') {
        updateVersion(param, ignore)
      } else if (param === 'build') {
        updateBuild()
      } else if (param === 'commit') {
        updateCommit()
      } else {
        printError()
        return
      }

    // Set
    } else if (arg === 'version') {
      i = ignore ? i + 2 : i + 1
      setVersion(param, ignore)
    } else if (arg === 'status') {
      i = ignore ? i + 2 : i + 1
      setStatus(param)

    // General
    } else if (arg === 'init') {
      init()
    } else if (arg === 'help') {
      printHelp()
    } else {
      printError()
      return
    }
  }
}())

/**
 * Create the appversion file from the default file (one time use).
 */
function init () {
  let obj = getJsonObj(JSON_FILE_DEFAULT)
  try {
    let fd = openSync(('./' + JSON_FILE), 'wx+')
    let json = `${JSON.stringify(obj, null, 2)}\n`
    writeFileSync(JSON_FILE, json)
    closeSync(fd)
  } catch (err) {
    console.log('File already exists\n')
  }
  console.log('Created the appversion.json, see apv help for the full instructions.\n')
}

/**
 * Returns the appversion json content.
 * @param  {String} filename [name of the json]
 * @return {Object}          [content of the json]
 */
function getJsonObj (filename) {
  checkType('string', filename)
  try {
    return JSON.parse(readFileSync(filename))
  } catch (err) {
    // throw new Error(`${JSON_FILE} not found.`)
    throw new Error(err)
  }
}

/**
 * Increase the major/minor/patch version number.
 * @param  {String} version [major/minor/patch]
 */
function updateVersion (version, ignore) {
  checkType('string', version)
  if (ignore) {
    checkType('string', ignore)
    if (ignore.indexOf('=') === -1) throw new Error('Insert a valid ignore string formatted in this way: "folder1|folder2"\n')
  }
  let obj = getJsonObj(JSON_FILE)
  obj.version[version]++
  if (version === 'major') {
    obj.version.minor = obj.version.patch = 0
  } else if (version === 'minor') {
    obj.version.patch = 0
  }
  obj.build.number = 0
  writeJson('version', obj.version, obj)
  updateVersionJson(obj, ignore)
  console.log(`Version updated to ${obj.version.major}.${obj.version.minor}.${obj.version.patch}\n`)
}

/**
 * Increase the build number and updates the date.
 */
function updateBuild () {
  let date = new Date()
  let obj = getJsonObj(JSON_FILE)
  obj.build.date = `${date.getFullYear()}.${date.getMonth() + 1 }.${date.getDate()}`
  obj.build.number++
  obj.build.total++
  writeJson('build', obj.build, obj)
  console.log(`Build updated to ${obj.build.number}/${obj.build.total}\n`)
}

/**
 * Updates the commit code.
 */
function updateCommit () {
  let obj = getJsonObj(JSON_FILE)
  exec('git log --oneline', function (error, stdout) {
    if (error) {
      console.log('No Git repository found.\n')
      writeJson('commit', null, obj)
    } else {
      writeJson('commit', stdout.substring(0, 7), obj)
      console.log(`Commit updated to ${stdout.substring(0, 7)}\n`)
    }
  })
}

/**
 * Sets a specific version number.
 * @param {String} newVersion [version number "x.y.z"]
 */
function setVersion (newVersion, ignore) {
  checkType('string', newVersion)
  if (ignore) {
    checkType('string', ignore)
    if (ignore.indexOf('=') === -1) throw new Error('Insert a valid ignore string formatted in this way: ignore="folder1|folder2"\n')
  }
  let obj = getJsonObj(JSON_FILE)
  let version = newVersion.split('.')
  if (version.length !== 3) throw new Error('Insert a valid version number formatted in this way: "x.y.z"\n')
  for (let i = 0; i < version.length; i++) {
    version[i] = Number(version[i])
    if (isNaN(version[i])) throw new Error('Insert a valid number.\n')
  }

  writeJson('version', {
    major: version[0],
    minor: version[1],
    patch: version[2]
  })
  writeJson('build', {
    date: obj.build.date,
    number: 0,
    total: obj.build.total
  })
  updateVersionJson(getJsonObj(JSON_FILE), ignore)
  console.log(`Version updated to ${version[0]}.${version[1]}.${version[2]}\n`)
}

/**
 * Sets a specific status.
 * @param {String} newStatus [status string "stable|rc|beta|alpha"]
 */
function setStatus (status) {
  checkType('string', status)
  if (status !== 'stable' && status !== 'rc' && status !== 'beta' && status !== 'alpha') throw new Error('Insert a valid status string.\n')
  writeJson('status', status)
  console.log(`Status updated to ${status}\n`)
}

/**
 * Wrote into the json the object/string passed as argument
 * @param  {String} field [field of the json]
 * @param  {Object/String} value [content]
 * @param  {Object} obj [Full object]
 */
function writeJson (field, value, obj = getJsonObj(JSON_FILE)) {
  checkType('string', field)
  obj[field] = value
  let json = `${JSON.stringify(obj, null, 2)}\n`
  writeFileSync(JSON_FILE, json)
}

/**
 * Updates the version in all the .json files present in appversion.json.
 * @param  {Object} obj [content]
 */
function updateVersionJson (obj = getJsonObj(JSON_FILE), ignore) {
  let currentVersion = `${obj.version.major}.${obj.version.minor}.${obj.version.patch}`
  for (let i = 0; i < obj.json.length; i++) updateOtherJson(obj.json[i], currentVersion, ignore)
}

/**
 * Extension of the above function.
 * @param  {String} filename  [Name of the json]
 * @param  {String} version   [version number x.y.z]
 */
function updateOtherJson (filename, version, ignore) {
  checkType('string', filename)
  checkType('string', version)
  if (ignore) {
    ignore = ignore.substr(ignore.indexOf('=') + 1).split('|')
    ignore.push('node_modules')
    ignore.push('bower_components')
  } else {
    ignore = ['node_modules', 'bower_components']
  }

  let walker = walk.walk('./', {
    followLinks: false,
    filters: ignore
  })

  walker.on('file', function (root, fileStats, next) {
    if (fileStats.name === filename) {
      let obj
      try {
        obj = JSON.parse(readFileSync(resolve(root, filename)))
      } catch (err) {
        return
      }
      obj.version = version
      let json = `${JSON.stringify(obj, null, 2)}\n`
      writeFileSync(resolve(root, filename), json)
    }
    next()
  })
}

/**
 * Checks the type of the passed variable.
 * @param  {String} type     [Type of the variable]
 * @param  {String} variable [variable]
 */
function checkType (type, variable) {
  if (typeof variable !== type) throw new Error(`Variable ${variable} is not a ${type}`)
}

/**
 * Prints the help message.
 */
function printHelp () {
  console.log(`
  | appversion - help |

  Semantic Versioning: http://semver.org/

  apv <cmd> <args>

  Commands list:
  cmd       args        description
  ----------------------------------------------------------
  update    major       Updates major number.
            minor       Updates minor number.
            patch       Updates patch number.
            build       Updates build number.
            commit      Updates commit code.
  ----------------------------------------------------------
  version   "x.y.z"     Sets a specific version number.
  ----------------------------------------------------------
  status    "stable"    Set the status to stable.
            "rc"        Set the status to rc.
            "beta"      Set the status to beta.
            "alpha"     Set the status to alpha.
  ----------------------------------------------------------
  init                  Generates the appversion.json file.
  ----------------------------------------------------------
  help                  Prints the commnds list.

    - If you want to ignore some folder:
    cmd       args        args
    --------------------------------------------------------
    update    major       ignore="folder1|folder2"
              minor
              patch
    --------------------------------------------------------
    version   "x.y.z"     ignore="folder1|folder2"

  Full example:
  apv version "1.1.0" ignore="somefolder"
  `)
}

/**
 * Prints the error message.
 */
function printError () {
  console.log('\nError, see apv help for instructions.\n')
}
