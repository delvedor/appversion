'use strict'

// Modules
const check = require('type-check').typeCheck
const semver = require('semver')
const request = require('request')
const chalk = require('chalk')
// apv parameters and functions
const apvVersion = require('./parameters').apvVersion

/**
 * This function updates the appversion.json to the latest appversion json structure.
 * @param  {Object} obj [actual appversion object]
 * @return {Object}     [correct appversion object]
 */
function updateAppversion (obj) {
  if (!check('Object', obj)) return
  // if the "config" filed is not present in the json we add it
  if (!obj.config) obj.config = { appversion: apvVersion, ignore: [], markdown: [], json: [] }
  // if the "ignore" filed is present in the json we move it to config
  if (obj.ignore) {
    obj.config.ignore = obj.ignore
    delete obj.ignore
  }
  // if the "markdown" filed is present in the json we move it to config
  if (obj.markdown) {
    obj.config.markdown = obj.markdown
    delete obj.markdown
  }
  // if the "markdown" filed is present in the json we move it to config
  if (obj.json) {
    obj.config.json = obj.json
    delete obj.json
  }
  // if the "package.json" and "bower.json" are present in the "config.json" array field, we remove them
  if (obj.config.json.indexOf('package.json') > -1) obj.config.json.splice(obj.config.json.indexOf('package.json'), 1)
  if (obj.config.json.indexOf('bower.json') > -1) obj.config.json.splice(obj.config.json.indexOf('bower.json'), 1)
  // Remove the appversion field
  if (obj.appversion) delete obj.appversion
  // updates the appversion.json version number
  obj.config.appversion = apvVersion
  console.log(chalk.green(`\n${chalk.bold('AppVersion:')} appversion.json updated to the latest version.\n`))
  return obj
}

/**
 * This function checks for an update of appversion.
 */
function checkUpdate () {
  let proxy = process.env.PROXY || process.env.http_proxy || null
  request({ url: 'https://registry.npmjs.org/appversion/latest', proxy: proxy }, (err, res, body) => {
    if (err && err.code === 'ENOTFOUND') return
    if (err) console.log(err)
    try {
      let latest = JSON.parse(body).version
      if (semver.gt(latest, apvVersion)) console.log(chalk.yellow(`\n${chalk.bold('AppVersion:')} New apv version available, run ${chalk.bold('\'npm install appversion -g\'')} to update!\n`))
    } catch (e) {
      console.log(e)
    }
  })
}

exports.updateAppversion = updateAppversion
exports.checkUpdate = checkUpdate
