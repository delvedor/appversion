'use strict'

// Modules
const check = require('type-check').typeCheck
const exec = require('child_process').exec
const chalk = require('chalk')
// apv parameters and functions
const JSON_FILE = require('./parameters').JSON_FILE
const readJson = require('./read').readJson
const writeJson = require('./write').writeJson
const writeOtherJson = require('./write').writeOtherJson
const createBadge = require('./badge').createBadge

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
    console.log(chalk.red(`\n${chalk.bold('AppVersion:')} type ${chalk.bold('\'apv -h\'')} to get more informations!\n`))
  }
}

/**
 * Increase the major|minor|patch version number.
 * @param  {String} version [major|minor|patch]
 */
function updateVersion (param) {
  let obj = readJson(JSON_FILE)
  obj.version[param]++
  if (param === 'major') obj.version.minor = obj.version.patch = 0
  if (param === 'minor') obj.version.patch = 0
  // The build number is reset whenever we update the version number
  obj.build.number = 0
  writeJson(obj, chalk.green(`\n${chalk.bold('AppVersion:')} Version updated to ${obj.version.major}.${obj.version.minor}.${obj.version.patch}\n`))
  writeOtherJson(`${obj.version.major}.${obj.version.minor}.${obj.version.patch}`)
  createBadge('version', true)
}

/**
 * Increase the build number and updates the date.
 */
function updateBuild () {
  let obj = readJson(JSON_FILE)
  // The date is a string representing the Date object
  obj.build.date = (new Date()).toString()
  obj.build.number++
  obj.build.total++
  writeJson(obj, chalk.green(`\n${chalk.bold('AppVersion:')} Build updated to ${obj.build.number}/${obj.build.total}\n`))
}

/**
 * Updates the commit code.
 */
function updateCommit () {
  let obj = readJson(JSON_FILE)
  exec('git log --oneline', function (error, stdout) {
    if (error) {
      obj.commit = null
      writeJson(obj, chalk.red(`\n${chalk.bold('AppVersion:')} No Git repository found.\n`))
    } else {
      obj.commit = stdout.substring(0, 7)
      writeJson(obj, chalk.green(`\n${chalk.bold('AppVersion:')} Commit updated to ${stdout.substring(0, 7)}\n`))
    }
  })
}

exports.update = update
