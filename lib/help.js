'use strict'

// Modules
const chalk = require('chalk')
// apv parameters and functions
const apvVersion = require('./parameters').apvVersion

function help () {
  console.log(chalk.cyan(`
  ${chalk.bold('AppVersion')} v${apvVersion}

  Usage: apv <cmd> <param>
  Options:

    -h, --help              output usage information
    -v, --version           output the version number
    update <param>          Updates the <param> that can be major|minor|patch|build|commit
    set-version <param>     Sets a specific version number, the <param> must be x.y.z
    set-status <param>      Sets a specific status, the <param> stage can be stable|rc|beta|alpha and the number must be a number
    generate-badge <param>  Generates the .md code of a shield badge with the version of your application, <param> can be version|status
    add-git-tag, --tag      Adds a tag with the version number to the git repo.
    init                    Generates the appversion.json file

  Semantic Versioning: http://semver.org
  AppVersion documentation: https://github.com/delvedor/appversion
`))
}

exports.help = help
