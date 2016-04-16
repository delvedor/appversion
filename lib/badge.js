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
 * @param  {Object} previousObj [Past version/status object]
 */
function createBadge (tag, updateMD, previousObj) {
  if (!check('String', tag) && !check('Boolean | Undefined', updateMD) && !check('Object | Undefined', previousObj)) return
  tag === 'status' ? statusBadge(updateMD, previousObj) : versionBadge(updateMD, previousObj)
}

function versionBadge (updateMD, previousObj) {
  let obj = readJson(JSON_FILE)
  let version = `${obj.version.major}.${obj.version.minor}.${obj.version.patch}`
  let readmeCode = composeReadmeCode('version', `AppVersion-${version}`)
  if (updateMD) {
    let pastVersion = `${previousObj.version.major}.${previousObj.version.minor}.${previousObj.version.patch}`
    let pastReadmeCode = composeReadmeCode('version', `AppVersion-${pastVersion}`)
    obj.config.markdown.map((file) => {
      return appendBadgeToMD(file, readmeCode, pastReadmeCode)
    })
  } else {
    printReadme(readmeCode, 'version')
  }
}

function statusBadge (updateMD, previousObj) {
  let obj = readJson(JSON_FILE)
  let status = obj.status.number > 0 ? `${obj.status.stage}%20${obj.status.number}` : obj.status.stage
  let readmeCode = composeReadmeCode('status', `Status-${status}`)
  if (updateMD) {
    let pastStatus = previousObj.status.number > 0 ? `${previousObj.status.stage}%20${previousObj.status.number}` : previousObj.status.stage
    let pastReadmeCode = composeReadmeCode('status', `Status-${pastStatus}`)
    obj.config.markdown.map((file) => {
      return appendBadgeToMD(file, readmeCode, pastReadmeCode)
    })
  } else {
    printReadme(readmeCode, 'status')
  }
}

function printReadme (code, tag) {
  console.log(chalk.green(`\n${chalk.bold('AppVersion:')} ${tag} badge generated!

${chalk.cyan(code)}
`))
}

exports.createBadge = createBadge
