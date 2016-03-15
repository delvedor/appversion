'use strict'

// Modules
const exec = require('child_process').exec
const chalk = require('chalk')
// apv parameters and functions
const JSON_FILE = require('./parameters').JSON_FILE
const readJson = require('./read').readJson
// Functional functions expressions
const versionCode = (version) => `v${version.major}.${version.minor}.${version.patch}`

/**
 * Adds a tag with the version number to the git repo.
 */
function addGitTag () {
  let obj = readJson(JSON_FILE)
  exec(`git tag ${versionCode(obj.version)}`, (error, stdout) => {
    if (error) {
      console.log(chalk.red(`${chalk.bold('AppVersion:')} Tag not added, no Git repository found.\n`))
    } else {
      console.log(chalk.green(`${chalk.bold('AppVersion:')} Added Git tag '${versionCode(obj.version)}'\n`))
    }
  })
}

exports.addGitTag = addGitTag
