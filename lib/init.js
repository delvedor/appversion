'use strict'

// Modules
const fs = require('fs')
const semver = require('semver')
const chalk = require('chalk')
const check = require('type-check').typeCheck
const resolve = require('path').resolve
// apv parameters and functions
const JSON_FILE_DEFAULT = require('./parameters').JSON_FILE_DEFAULT
const JSON_FILE = require('./parameters').JSON_FILE
const readJson = require('./read').readJson

/**
 * Creates the appversion file from the default file (one time use).
 */
function init () {
  let obj = readJson(JSON_FILE_DEFAULT)
  let packagejson = readJson(resolve('./', 'package.json'))
  try {
    if (packagejson) obj.version = getVersion(packagejson)
    let fd = fs.openSync(resolve('./', JSON_FILE), 'wx+')
    let json = `${JSON.stringify(obj, null, 2)}\n`
    fs.writeFileSync(JSON_FILE, json)
    fs.closeSync(fd)
    console.log(chalk.green(`\n${chalk.bold('AppVersion:')} appversion.json created, type ${chalk.bold('\'apv -h\'')} to get more informations!\n`))
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.log(chalk.red(`\n${chalk.bold('AppVersion:')} appversion.json already exists, type ${chalk.bold('\'apv -h\'')} to get more informations!\n`))
      return
    }
    throw new Error(err)
  }
}

/**
 * Read the version field from a json file (package.json) and return an object divided in major|minor|patch
 * @param  {Object} obj [json file]
 * @return {Object}     [object divided in major|minor|patch]
 */
function getVersion (obj) {
  if (!check('Object', obj)) return
  obj.version = semver.clean(obj.version)
  if (!semver.valid(obj.version)) return
  let versionArray = obj.version.split('.')
  return {
    major: Number(versionArray[0]),
    minor: Number(versionArray[1]),
    patch: Number(versionArray[2])
  }
}

exports.init = init
