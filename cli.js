#!/usr/bin/env node
'use strict';

var _fs = require('fs');

var _child_process = require('child_process');

// Filenames
var JSON_FILE = 'appversion.json';
var JSON_FILE_DEFAULT = __dirname + '/appversion.default.json';

/**
 * Gets the input from the console and calls the correct function.
 */
(function () {
  var arg = undefined;
  var param = undefined;
  if (process.argv.length === 2) printHelp();
  for (var i = 2; i < process.argv.length; i++) {
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
})();

/**
 * Create the appversion file from the default file (one time use).
 */
function init() {
  var obj = getJsonObj(JSON_FILE_DEFAULT);
  try {
    var fd = (0, _fs.openSync)('./' + JSON_FILE, 'wx+');
    var json = JSON.stringify(obj, null, 2) + '\n';
    (0, _fs.writeFileSync)(JSON_FILE, json);
    (0, _fs.closeSync)(fd);
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
    return JSON.parse((0, _fs.readFileSync)(filename));
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
  var obj = getJsonObj(JSON_FILE);
  obj.version[version]++;
  if (version === 'major') obj.version.minor = obj.version.patch = 0;else if (version === 'minor') obj.version.patch = 0;
  obj.build.number = 0;
  writeJson('version', obj.version, obj);
  updateVersionJson(obj);
}

/**
 * Increase the build number and updates the date.
 */
function updateBuild() {
  var date = new Date();
  var obj = getJsonObj(JSON_FILE);
  obj.build.date = date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDate();
  obj.build.number++;
  obj.build.total++;
  writeJson('build', obj.build, obj);
}

/**
 * Updates the commit code.
 */
function updateCommit() {
  var obj = getJsonObj(JSON_FILE);
  (0, _child_process.exec)('git log --oneline', function (error, stdout) {
    if (error) {
      console.log('No Git repository found.');
      writeJson('commit', null, obj);
    } else writeJson('commit', stdout.substring(0, 7), obj);
  });
}

/**
 * Sets a specific version number.
 * @param {String} newVersion [version number "x.y.z"]
 */
function setVersion(newVersion) {
  checkType('string', newVersion);
  var obj = getJsonObj(JSON_FILE);
  var version = newVersion.split('.');
  if (version.length !== 3) throw new Error('Insert a valid version number formatted in this way: "x.y.z"');
  for (var i = 0; i < version.length; i++) {
    version[i] = Number(version[i]);
    if (isNaN(version[i])) throw new Error('Insert a valid number.');
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
  if (status !== 'stable' && status !== 'rc' && status !== 'beta' && status !== 'alpha') throw new Error('Insert a valid status string.');
  writeJson('status', status);
}

/**
 * Wrote into the json the object/string passed as argument
 * @param  {String} field [field of the json]
 * @param  {Object/String} value [content]
 * @param  {Object} obj [Full object]
 */
function writeJson(field, value) {
  var obj = arguments.length <= 2 || arguments[2] === undefined ? getJsonObj(JSON_FILE) : arguments[2];

  checkType('string', field);
  obj[field] = value;
  var json = JSON.stringify(obj, null, 2) + '\n';
  (0, _fs.writeFileSync)(JSON_FILE, json);
}

/**
 * Updates the version in all the .json files present in appversion.json.
 * @param  {Object} obj [content]
 */
function updateVersionJson() {
  var obj = arguments.length <= 0 || arguments[0] === undefined ? getJsonObj(JSON_FILE) : arguments[0];

  var currentVersion = obj.version.major + '.' + obj.version.minor + '.' + obj.version.patch;
  for (var i = 0; i < obj.json.length; i++) {
    updateOtherJson(obj.json[i], currentVersion);
  }
}

/**
 * Extension of the above function.
 * @param  {String} filename  [Name of the json]
 * @param  {String} version   [version number x.y.z]
 */
function updateOtherJson(filename, version) {
  checkType('string', filename);
  checkType('string', version);
  var obj = undefined;
  try {
    obj = JSON.parse((0, _fs.readFileSync)(filename));
  } catch (err) {
    return;
  }
  obj.version = version;
  var json = JSON.stringify(obj, null, 2) + '\n';
  (0, _fs.writeFileSync)(filename, json);
}

/**
 * Checks the type of the passed variable.
 * @param  {String} type     [Type of the variable]
 * @param  {String} variable [variable]
 */
function checkType(type, variable) {
  if (typeof variable !== type) throw new Error('Variable ' + variable + ' is not a ' + type);
}

/**
 * Prints the help message.
 */
function printHelp() {
  console.log('\n  | appversion - help |\n\n  Semantic Versioning: http://semver.org/\n\n  apv <cmd> <args>\n\n  Commands list:\n  cmd       args        description\n  ----------------------------------------------------------\n  update    major       Updates major number.\n            minor       Updates minor number.\n            patch       Updates patch number.\n            build       Updates build number.\n            commit      Updates commit code.\n  ----------------------------------------------------------\n  version   "x.y.z"     Sets a specific version number.\n  ----------------------------------------------------------\n  status    "stable"    Set the status to stable.\n            "rc"        Set the status to rc.\n            "beta"      Set the status to beta.\n            "alpha"     Set the status to alpha.\n  ----------------------------------------------------------\n  init                  Generates the appversion.json file.\n  ----------------------------------------------------------\n  help                  Prints the commnds list.\n\n  ');
}

/**
 * Prints the error message.
 */
function printError() {
  console.log('\nError, see apv help for instructions.\n');
}
