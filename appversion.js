/*
 * Project: appversion
 * Version: 1.3.0
 * Author: delvedor
 * Twitter: @delvedor
 * License: GNU GPLv2
 * GitHub: https://github.com/delvedor/appversion
 */

'use strict'

const fs = require('fs')
const path = require('path')
const directory = require('app-root-path').path
const check = require('type-check').typeCheck
const JSON_FILE = 'appversion.json'

/**
 * Returns the content of appversion.json as a object.
 * Sync version.
 * @return {Object} [appversion object]
 */
function getAppVersionSync () {
  try {
    let obj = JSON.parse(fs.readFileSync(path.join(directory, JSON_FILE)))
    delete obj.json
    delete obj.ignore
    delete obj.markdown
    delete obj.appversion
    return obj
  } catch (err) {
    throw new Error(err)
  }
}

/**
 * Returns the content of appversion.json as a object.
 * Async version.
 * @param  {Function} callback [callback]
 * @return {Object} [appversion object]
 */
function getAppVersion (callback) {
  if (!check('Function', callback)) throw new Error('getAppVersion() -> callback is not a function')
  fs.readFile(path.join(directory, JSON_FILE), (err, data) => {
    data = JSON.parse(data)
    if (data) {
      delete data.json
      delete data.ignore
      delete data.markdown
      delete data.appversion
    }
    callback(err, data)
  })
}

/**
 * Returns a string with the version following the pattern you passed as a input.
 * Sync version.
 * @return {String} [appversion string]
 *
 * pattern:
 * M : version.major
 * m : version.minor
 * p : version.patch
 * S : status.stage
 * s : status.number
 * n : build.number
 * t : build.total
 * d : build.date
 * c : commit
 * . : separator
 * - : separator
 */
function composePatternSync (pattern) {
  if (!check('String', pattern)) throw new Error('composePatternSync() -> pattern is not a string')
  pattern = pattern.split('')
  let obj = getAppVersionSync()
  let ptt = ''
  for (let i = 0; i < pattern.length; i++) {
    let ele = pattern[i]
    if (ele === 'M') {
      ptt += obj.version.major
    } else if (ele === 'm') {
      ptt += obj.version.minor
    } else if (ele === 'p') {
      ptt += obj.version.patch
    } else if (ele === 'S') {
      ptt += obj.status.stage
    } else if (ele === 's') {
      ptt += obj.status.number
    } else if (ele === 'n') {
      ptt += obj.build.number
    } else if (ele === 't') {
      ptt += obj.build.total
    } else if (ele === 'd') {
      ptt += obj.build.date
    } else if (ele === 'c') {
      ptt += obj.commit
    } else {
      ptt += ele
    }
  }
  return ptt
}

/**
 * Returns a string with the version following the pattern you passed as a input.
 * Async version.
 * @param  {Function} callback [callback]
 * @return {String} [appversion string]
 */
function composePattern (pattern, callback) {
  if (!check('String', pattern)) throw new Error('composePattern() -> pattern is not a string')
  if (!check('Function', callback)) throw new Error('composePattern() -> callback is not a function')
  pattern = pattern.split('')
  getAppVersion((err, obj) => {
    if (err) console.log(err)
    let ptt = ''
    for (let i = 0; i < pattern.length; i++) {
      let ele = pattern[i]
      if (ele === 'M') {
        ptt += obj.version.major
      } else if (ele === 'm') {
        ptt += obj.version.minor
      } else if (ele === 'p') {
        ptt += obj.version.patch
      } else if (ele === 'S') {
        ptt += obj.status.stage
      } else if (ele === 's') {
        ptt += obj.status.number
      } else if (ele === 'n') {
        ptt += obj.build.number
      } else if (ele === 't') {
        ptt += obj.build.total
      } else if (ele === 'd') {
        ptt += obj.build.date
      } else if (ele === 'c') {
        ptt += obj.commit
      } else {
        ptt += ele
      }
    }
    callback(ptt)
  })
}

exports.getAppVersionSync = getAppVersionSync
exports.getAppVersion = getAppVersion
exports.composePatternSync = composePatternSync
exports.composePattern = composePattern
