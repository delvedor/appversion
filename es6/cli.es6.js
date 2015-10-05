#!/usr/bin/env node

import {
  readFileSync, writeFileSync, openSync, closeSync
}
from 'fs';

import {
  exec
}
from 'child_process';

// Filenames
const JSON_FILE = 'appversion.json';
const JSON_FILE_DEFAULT = `${__dirname}/appversion.default.json`;

/**
 * Gets the input from the console and calls the correct function.
 */
(function() {
  let arg;
  let param;
  if (process.argv.length === 2)
    printHelp();
  for (let i = 2; i < process.argv.length; i++) {
    arg = process.argv[i];
    param = process.argv[i + 1];
    // Update
    if (arg === 'update') {
      i++;
      if (param === 'major' || param === 'minor' || param === 'patch') {
        updateVersion(param);
      } else if (param === 'build') {
        updateBuild();
      } else if (param === 'commit') {
        updateCommit();
      } else {
        printError();
        return;
      }

      // Set
    } else if (arg === 'version') {
      i++;
      setVersion(param);

    } else if (arg === 'status') {
      i++;
      setStatus(param);

      // General
    } else if (arg === 'init') {
      init();
    } else if (arg === 'help') {
      printHelp();

      // All other cases
    } else {
      printError();
      return;
    }
  }
}());

/**
 * Create the appversion file from the default file (one time use).
 */
function init() {
  let obj = getJsonObj(JSON_FILE_DEFAULT);
  try {
    let fd = openSync(('./' + JSON_FILE), 'wx+');
    let json = JSON.stringify(obj, null, 2) + '\n';
    writeFileSync(JSON_FILE, json);
    closeSync(fd);
  } catch (err) {
    console.log('File already exists');
  }
  console.log('Created the appversion.json, see apv help for the full instructions.');
}

/**
 * Returns the appversion json content.
 * @param  {String} filename [name of the json]
 * @return {Object}          [content of the json]
 */
function getJsonObj(filename) {
  checkType('string', filename);
  try {
    return JSON.parse(readFileSync(filename));
  } catch (err) {
    //throw new Error(`${JSON_FILE} not found.`);
    throw new Error(err);
  }
}

/**
 * Increase the major/minor/patch version number.
 * @param  {String} version [major/minor/patch]
 */
function updateVersion(version) {
  checkType('string', version);
  let obj = getJsonObj(JSON_FILE);
  obj.version[version]++;
  if (version === 'major')
    obj.version.minor = obj.version.patch = 0;
  else if (version === 'minor')
    obj.version.patch = 0;
  obj.build.number = 0;
  writeJson('version', obj.version, obj);
  updateVersionJson(obj);
}

/**
 * Increase the build number and updates the date.
 */
function updateBuild() {
  let date = new Date();
  let obj = getJsonObj(JSON_FILE);
  obj.build.date = `${date.getFullYear()}.${date.getMonth() + 1 }.${date.getDate()}`;
  obj.build.number++;
  obj.build.total++;
  writeJson('build', obj.build, obj);
}

/**
 * Updates the commit code.
 */
function updateCommit() {
  let obj = getJsonObj(JSON_FILE);
  exec('git log --oneline', function(error, stdout) {
    if (error) {
      console.log('No Git repository found.');
      writeJson('commit', null, obj);
    } else
      writeJson('commit', stdout.substring(0, 7), obj);
  });
}

/**
 * Sets a specific version number.
 * @param {String} newVersion [version number "x.y.z"]
 */
function setVersion(newVersion) {
  checkType('string', newVersion);
  let obj = getJsonObj(JSON_FILE);
  let version = newVersion.split('.');
  if (version.length !== 3)
    throw new Error('Insert a valid version number formatted in this way: "x.y.z"');
  for (let i = 0; i < version.length; i++) {
    version[i] = Number(version[i]);
    if (isNaN(version[i]))
      throw new Error('Insert a valid number.');
  }

  writeJson('version', {
    major: version[0],
    minor: version[1],
    patch: version[2]
  });
  writeJson('build', {
    date: obj.build.date,
    number: 0,
    total: obj.build.total
  });
  updateVersionJson();
}

/**
 * Sets a specific status.
 * @param {String} newStatus [status string "stable|rc|beta|alpha"]
 */
function setStatus(status) {
  checkType('string', status);
  if (status !== 'stable' && status !== 'rc' && status !== 'beta' && status !== 'alpha')
    throw new Error('Insert a valid status string.');
  writeJson('status', status);
}

/**
 * Wrote into the json the object/string passed as argument
 * @param  {String} field [field of the json]
 * @param  {Object/String} value [content]
 * @param  {Object} obj [Full object]
 */
function writeJson(field, value, obj = getJsonObj(JSON_FILE)) {
  checkType('string', field);
  obj[field] = value;
  let json = JSON.stringify(obj, null, 2) + '\n';
  writeFileSync(JSON_FILE, json);
}

/**
 * Updates the version in all the .json files present in appversion.json.
 * @param  {Object} obj [content]
 */
function updateVersionJson(obj = getJsonObj(JSON_FILE)) {
  let currentVersion = `${obj.version.major}.${obj.version.minor}.${obj.version.patch}`;
  for (let i = 0; i < obj.json.length; i++)
    updateOtherJson(obj.json[i], currentVersion);
}

/**
 * Extension of the above function.
 * @param  {String} filename  [Name of the json]
 * @param  {String} version   [version number x.y.z]
 */
function updateOtherJson(filename, version) {
  checkType('string', filename);
  checkType('string', version);
  let obj;
  try {
    obj = JSON.parse(readFileSync(filename));
  } catch (err) {
    return;
  }
  obj.version = version;
  let json = JSON.stringify(obj, null, 2) + '\n';
  writeFileSync(filename, json);
}

/**
 * Checks the type of the passed variable.
 * @param  {String} type     [Type of the variable]
 * @param  {String} variable [variable]
 */
function checkType(type, variable) {
  if (typeof variable !== type)
    throw new Error(`Variable ${variable} is not a ${type}`);
}

/**
 * Prints the help message.
 */
function printHelp() {
  console.log(`
  | appversion - help |

  Semantic Versioning: http://semver.org/

  apv <cmd> <args>

  Commands list:
  cmd       args        description
  ----------------------------------------------------------
  update    major       Updates major number.
            minor       Updates minor number.
            patch       Updates patch number.
            build       Updates build number.
            commit      Updates commit code.
  ----------------------------------------------------------
  version   "x.y.z"     Sets a specific version number.
  ----------------------------------------------------------
  status    "stable"    Set the status to stable.
            "rc"        Set the status to rc.
            "beta"      Set the status to beta.
            "alpha"     Set the status to alpha.
  ----------------------------------------------------------
  init                  Generates the appversion.json file.
  ----------------------------------------------------------
  help                  Prints the commnds list.

  `);
}

/**
 * Prints the error message.
 */
function printError() {
  console.log('\nError, see apv help for instructions.\n');
}
