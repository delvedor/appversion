'use strict'

// Modules
const resolve = require('path').resolve
// apv parameters and functions
exports.apvVersion = '1.5.0'
exports.JSON_FILE = 'appversion.json'
exports.JSON_FILE_DEFAULT = resolve(__dirname, '../', 'appversion.default.json')
exports.helpDocs = `  Semantic Versioning: http://semver.org
  AppVersion documentation: https://github.com/delvedor/appversion\n`
