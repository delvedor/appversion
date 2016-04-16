'use strict'

// Modules
const fs = require('fs')
const join = require('path').join
const directory = require('app-root-path').path
const check = require('type-check').typeCheck
// apv parameters and functions
const JSON_FILE = 'appversion.json'

/**
 * Returns the content of appversion.json as a object.
 * Sync version.
 * @return {Object} [appversion object]
 */
function getAppVersionSync () {
  try {
    let obj = require(join(directory, JSON_FILE))
    delete obj.config
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
  fs.readFile(join(directory, JSON_FILE), (err, data) => {
    data = JSON.parse(data)
    if (data) delete data.config
    callback(err, data)
  })
}

/**
 * Returns a string with the version following the pattern you passed as a input.
 * Sync version.
 * @return {String} [appversion string]
 */
function composePatternSync (pattern) {
  if (!check('String', pattern)) throw new Error('composePatternSync() -> pattern is not a string')
  pattern = pattern.split('')
  let obj = getAppVersionSync()
  let ptt = ''
  pattern.map((ele) => {
    ptt += switchPattern(obj, ele)
  })
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
    pattern.map((ele) => {
      ptt += switchPattern(obj, ele)
    })
    callback(ptt)
  })
}

/**
 * Returns the correspondent obj parameter, if not, it returns the given pattern.
 * @param  {Object} obj     [appversion object]
 * @param  {String} pattern [pattern]
 * @return {String}         [correspondent pattern]
 *
 * pattern:
 * M|B : version.major
 * m|F : version.minor
 * p|f : version.patch
 * S : status.stage
 * s : status.number
 * n : build.number
 * t : build.total
 * d : build.date
 * c : commit
 * . : separator
 * - : separator
 */
function switchPattern (obj, pattern) {
  if (!check('String', pattern)) throw new Error('switchPattern() -> pattern is not a string')
  if (!check('Object', obj)) throw new Error('switchPattern() -> obj is not an object')
  switch (pattern) {
    case 'M' || 'B':
      return obj.version.major
    case 'm' || 'F':
      return obj.version.minor
    case 'p' || 'f':
      return obj.version.patch
    case 'S':
      return obj.status.stage
    case 's':
      return obj.status.number
    case 'n':
      return obj.build.number
    case 't':
      return obj.build.total
    case 'd':
      return obj.build.date
    case 'c':
      return obj.commit
    default:
      return pattern
  }
}

exports.getAppVersionSync = getAppVersionSync
exports.getAppVersion = getAppVersion
exports.composePatternSync = composePatternSync
exports.composePattern = composePattern
