#! /usr/bin/env node

/*
 * Project: appversion
 * Version: 1.5.2
 * Author: delvedor
 * Twitter: @delvedor
 * License: MIT
 * GitHub: https://github.com/delvedor/appversion
 */

'use strict'

// Modules
const minimist = require('minimist')
const chalk = require('chalk')
// apv parameters and functions
const update = require('./lib/update').update
const setVersion = require('./lib/set').setVersion
const setStatus = require('./lib/set').setStatus
const createBadge = require('./lib/badge').createBadge
const init = require('./lib/init').init
const addGitTag = require('./lib/git').addGitTag
const checkUpdate = require('./lib/updater').checkUpdate
const apvVersion = require('./lib/parameters').apvVersion
const help = require('./lib/help').help

// arguments parser
const args = minimist(process.argv.slice(2))

// if the flag -v|--version is passed
if (args.v || args.version) {
  console.log(chalk.cyan(apvVersion))
  process.exit(1)
}

// if the flag -h|--help is passed
if (args.h || args.help) {
  help()
  process.exit(1)
}

// if there are not arguments
if (!args._.length) {
  help()
  process.exit(1)
}

if (args._.length > 2) console.log(chalk.yellow('AppVersion accepts only one command per time'))

const cmd = args._[0]
const param = args._[1] || null
switch (cmd) {
  case 'update':
    update(param)
    if (args.tag) addGitTag()
    break
  case 'set-version':
    setVersion(param)
    if (args.tag) addGitTag()
    break
  case 'set-status':
    setStatus(param)
    break
  case 'generate-badge':
    createBadge(param)
    break
  case 'add-git-tag':
    addGitTag()
    break
  case 'init':
    init()
    break
  default:
    help()
}

// Checks for an update
checkUpdate()
