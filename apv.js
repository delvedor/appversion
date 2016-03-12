#! /usr/bin/env node

/*
 * Project: appversion
 * Version: 1.4.0
 * Author: delvedor
 * Twitter: @delvedor
 * License: GNU GPLv2
 * GitHub: https://github.com/delvedor/appversion
 */

'use strict'

// Modules
const program = require('commander')
// apv parameters and functions
const update = require('./lib/update').update
const setVersion = require('./lib/set').setVersion
const setStatus = require('./lib/set').setStatus
const createBadge = require('./lib/badge').createBadge
const init = require('./lib/init').init
const checkUpdate = require('./lib/updater').checkUpdate
const apvVersion = require('./lib/parameters').apvVersion
const helpDocs = require('./lib/parameters').helpDocs

// commands arguments
program
  .version(apvVersion)
  .usage('<option> <param>')
  .option('update <param>', 'Updates the <param> that can be major|minor|patch|build|commit', update)
  .option('set-version <param>', 'Sets a specific version number, the <param> must be x.y.z', setVersion)
  .option('set-status <param>', 'Sets a specific status, the <param> stage can be stable|rc|beta|alpha and the number must be a number', setStatus)
  .option('generate-badge <param>', 'Generates the .md code of a shield badge with the version of your application, <param> can be version|status', createBadge)
  .option('init', 'Generates the appversion.json file', init)
  .on('*', function (command) {
    this.commands.some(function (command) {
      return command._name === process.argv[0]
    }) || this.help()
  })

// Custom docs
program.on('--help', () => {
  console.log(helpDocs)
})

program.parse(process.argv)
// Calls help() if there are no parameters
if (process.argv.length <= 2) program.help()

// Checks for an update
checkUpdate()
