/*
 * Project: appversion
 * Version: 1.7.0
 * Author: delvedor
 * Twitter: @delvedor
 * License: MIT
 * GitHub: https://github.com/delvedor/appversion
 */

'use strict'

/**
 * Exposes the apv APIs for the automation.
 */
exports.update = require('./lib/update').update
exports.setVersion = require('./lib/set').setVersion
exports.setStatus = require('./lib/set').setStatus
