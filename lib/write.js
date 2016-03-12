'use strict'

// Modules
const fs = require('fs')
const resolve = require('path').resolve
const check = require('type-check').typeCheck
const walk = require('walk')
// apv parameters and functions
const JSON_FILE = require('./parameters').JSON_FILE
const readJson = require('./read').readJson

/**
 * Search and updates the badge in a .md file.
 * @param  {String} url          [The new url]
 * @param  {String} markdownFile [The name of the .md file]
 * @param  {String} tag          [version or status tag]
 * @param  {String} getParam     [parameter to put at the end of the url]
 */
function appendBadgeToMD (url, markdownFile, tag, getParam) {
  if (!check('String', url) || !check('String', markdownFile) || !check('String', tag) || !check('String', getParam)) return
  try {
    fs.readFile(resolve('./', markdownFile), 'utf8', (err, data) => {
      if (err) console.log(err)
      // if the badge not exist in the .md file
      if (data.substring(0, data.indexOf(tag)) === -1) return
      // update .md file
      let apvBadge = `${data.substring(0, data.indexOf(tag))}${tag}(${url})]${data.substring(data.indexOf('(https://github.com/delvedor/appversion' + getParam + ')'))}`
      fs.writeFile(resolve('./', markdownFile), apvBadge, (err) => { if (err) console.log(err) })
    })
  } catch (err) {
    console.log(err)
  }
}

/**
 * Wrote into the json the object passed as argument
 * @param  {Object} obj [Full object]
 * @param  {String} message [Optional message]
 */
function writeJson (obj, message) {
  if (!check('Object', obj) || !check('String | Undefined', message)) return
  let json = `${JSON.stringify(obj, null, 2)}\n`
  try {
    fs.writeFileSync(JSON_FILE, json)
    if (message) console.log(message)
  } catch (err) {
    throw new Error(err)
  }
}

/**
 * Extension of the above function.
 * Updates package.json, bower.json and all other json in appversion.json
 * @param  {String} version   [version number x.y.z]
 */
function writeOtherJson (version) {
  if (!check('String', version)) return
  let obj = readJson(JSON_FILE)
  // ignore every subfolder in the project
  if (obj.config.ignore.indexOf('*') > -1) return
  // default ignored subfolders
  obj.config.ignore.push('node_modules', 'bower_components', '.git')
  // default json files
  obj.config.json.push('package.json')

  let walker = walk.walk(resolve('./'), {followLinks: false, filters: obj.config.ignore})

  walker.on('file', function (root, fileStats, next) {
    // if the filename is inside the appversion's json array
    if (obj.config.json.indexOf(fileStats.name) > -1) {
      let fileObj
      try {
        fileObj = JSON.parse(fs.readFileSync(resolve(root, fileStats.name)))
      } catch (err) {
        return
      }
      // If the "version" field is not present in the json file we add it
      fileObj.version = version
      let json = `${JSON.stringify(fileObj, null, 2)}\n`
      fs.writeFileSync(resolve(root, fileStats.name), json)
    }
    next()
  })
}

exports.appendBadgeToMD = appendBadgeToMD
exports.writeJson = writeJson
exports.writeOtherJson = writeOtherJson
