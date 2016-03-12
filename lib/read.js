'use strict'

// Modules
const check = require('type-check').typeCheck
const resolve = require('path').resolve
const fs = require('fs')
const chalk = require('chalk')
// apv parameters and functions
const apvVersion = require('./parameters').apvVersion
const JSON_FILE = require('./parameters').JSON_FILE
const updateAppversion = require('./updater').updateAppversion

/**
 * Returns the appversion json content.
 * @param  {String} filename [name of the json]
 * @return {Object}          [content of the json]
 */
function readJson (file) {
  if (!check('String', file)) return
  try {
    let obj = JSON.parse(fs.readFileSync(file === JSON_FILE ? resolve('./', file) : resolve(file)))
    // checks if the appversion.json is at the latest version
    if (file === JSON_FILE && (!obj.config || obj.config.appversion !== apvVersion)) obj = updateAppversion(obj)
    return obj
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(chalk.red(`\n${chalk.bold('AppVersion:')} Could not find appversion.json\nType ${chalk.bold('\'apv init\'')} for generate the file and start use AppVersion.\n`))
      process.exit(1)
    } else {
      throw new Error(err)
    }
  }
}

exports.readJson = readJson
