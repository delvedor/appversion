'use strict'

// Modules
const check = require('type-check').typeCheck
const semver = require('semver')
const chalk = require('chalk')
// apv parameters and functions
const JSON_FILE = require('./parameters').JSON_FILE
const readJson = require('./read').readJson
const writeJson = require('./write').writeJson
const writeOtherJson = require('./write').writeOtherJson
const createBadge = require('./badge').createBadge

/**
 * Sets a specific version number.
 * @param {String} newVersion [version number "x.y.z"]
 */
function setVersion (param) {
  if (!check('String', param)) return
  let obj = readJson(JSON_FILE)
  let previousObj = {
    version: {
      major: obj.version.major,
      minor: obj.version.minor,
      patch: obj.version.patch
    }
  }
  param = semver.clean(param)
  if (!semver.valid(param)) {
    console.log(chalk.red(`\n${chalk.bold('AppVersion:')} Insert a valid version number formatted in this way: ${chalk.bold('\'x.y.z\'')} where x|y|z are numbers.\n`))
    return
  }
  let version = param.split('.')
  obj.version.major = Number(version[0])
  obj.version.minor = Number(version[1])
  obj.version.patch = Number(version[2])
  // The build number is reset whenever we update the version number
  obj.build.number = 0
  writeJson(obj, chalk.green(`\n${chalk.bold('AppVersion:')} Version updated to ${version[0]}.${version[1]}.${version[2]}\n`))
  writeOtherJson(`${version[0]}.${version[1]}.${version[2]}`)
  createBadge('version', true, previousObj)
}

/**
 * Sets a specific status.
 * @param {String} newStatus [status string "stable|rc|beta|alpha"]
 */
function setStatus (param) {
  if (!check('String', param)) return
  let obj = readJson(JSON_FILE)
  let previousObj = {
    status: {
      stage: obj.status.stage,
      number: obj.status.number
    }
  }
  let status = param.split('.')
  if (status[1] && !check('Number', Number(status[1]))) {
    console.log(chalk.red(`\n${chalk.bold('AppVersion:')} Insert a valid status.number number\n`))
    return
  }
  let match = ['Stable', 'stable', 'RC', 'rc', 'Beta', 'beta', 'Alpha', 'alpha']
  if (match.indexOf(status[0]) === -1) {
    console.log(chalk.red(`\n${chalk.bold('AppVersion:')} Insert a valid status.stage string\n`))
    return
  }
  obj.status.stage = status[0]
  // if there's not the status number, it's setted to zero
  obj.status.number = Number(status[1]) || 0
  writeJson(obj, chalk.green(`\n${chalk.bold('AppVersion:')} Status updated to ${status[0]}.${status[1] || 0}\n`))
  createBadge('status', true, previousObj)
}

exports.setVersion = setVersion
exports.setStatus = setStatus
