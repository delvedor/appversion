'use strict'

// Modules
const check = require('type-check').typeCheck
const chalk = require('chalk')
// apv parameters and functions
const JSON_FILE = require('./parameters').JSON_FILE
const readJson = require('./read').readJson
const appendBadgeToMD = require('./write').appendBadgeToMD
// Functional functions expressions
const shieldUrl = (part) => `https://img.shields.io/badge/${part}-brightgreen.svg?style=flat`
const mdCode = (tag, url) => `[![AppVersion-${tag}](${url})](https://github.com/delvedor/appversion?#${tag})`
const composeReadmeCode = (tag, part) => mdCode(tag, shieldUrl(part))

/**
 * Generates the badge with the current version.
 * @param {String}   tag      [Toggle version/status generation.]
 * @param  {Boolean} updateMD [If this parameter is undefined means that the function was called by the user, so it outputs the badge code.]
 */
function createBadge (tag, updateMD) {
  if (!check('String', tag) && !check('Boolean | Undefined', updateMD)) return
  let obj = readJson(JSON_FILE)
  let parameter
  // If the status.number is zero is not displayed
  if (tag === 'status') {
    parameter = obj.status.number > 0 ? `${obj.status.stage}%20${obj.status.number}` : obj.status.stage
  } else {
    parameter = `${obj.version.major}.${obj.version.minor}.${obj.version.patch}`
  }
  if (updateMD) {
    // compose the url
    let url = tag === 'version' ? shieldUrl(`AppVersion-${parameter}`) : shieldUrl(`Status-${parameter}`)
    obj.config.markdown.map((file) => {
      return appendBadgeToMD(url, file, `[![AppVersion-${tag}]`, `?#${tag}`)
    })
  } else {
    // compose the badge .md code
    let readmeCode = tag === 'version' ? composeReadmeCode(tag, `AppVersion-${parameter}`) : composeReadmeCode(tag, `Status-${parameter}`)
    console.log(chalk.green(`\n${chalk.bold('AppVersion:')} ${tag} badge generated!

${chalk.cyan(readmeCode)}
  `))
  }
}

exports.createBadge = createBadge
