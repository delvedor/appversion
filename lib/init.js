'use strict'

// Modules
const fs = require('fs')
const resolve = require('path').resolve
const chalk = require('chalk')
// apv parameters and functions
const JSON_FILE_DEFAULT = require('./parameters').JSON_FILE_DEFAULT
const JSON_FILE = require('./parameters').JSON_FILE
const readJson = require('./read').readJson

/**
 * Creates the appversion file from the default file (one time use).
 */
function init () {
  let obj = readJson(JSON_FILE_DEFAULT)
  try {
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

exports.init = init
