'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getAppVersionSync = getAppVersionSync;
exports.getAppVersion = getAppVersion;
exports.composePatternSync = composePatternSync;
exports.composePattern = composePattern;

var _fs = require('fs');

var _path = require('path');

var _os = require('os');

var JSON_FILE = 'appversion.json';
var slash = undefined;
if ((0, _os.platform)() === 'darwin') slash = '/';else slash = '\\';
var dir = (0, _path.resolve)(__dirname).split(slash + 'node_modules')[0];

function getAppVersionSync() {
  try {
    var obj = JSON.parse((0, _fs.readFileSync)('' + dir + slash + JSON_FILE));
    delete obj.json;
    return obj;
  } catch (err) {
    throw new Error(JSON_FILE + ' not found.');
  }
}

function getAppVersion(callback) {
  (0, _fs.readFile)('' + dir + slash + JSON_FILE, function (err, data) {
    data = JSON.parse(data);
    if (data) delete data.json;
    callback(err, data);
  });
}

// pattern:
// M : mayor
// m : minor
// p : patch
// s : status
// n : build number
// t : build total
// d : build Date
// c : commit
// . : separator
// - : separator

function composePatternSync(pattern) {
  if (typeof pattern !== 'string') throw new Error('compose() -> pattern is not a string');
  pattern = pattern.split('');
  var obj = getAppVersionSync();
  var ptt = '';
  for (var i = 0; i < pattern.length; i++) {
    var ele = pattern[i];
    if (ele === 'M') ptt += obj.version.major;else if (ele === 'm') ptt += obj.version.minor;else if (ele === 'p') ptt += obj.version.patch;else if (ele === 's') ptt += obj.status;else if (ele === 'n') ptt += obj.build.number;else if (ele === 't') ptt += obj.build.total;else if (ele === 'd') ptt += obj.build.date;else if (ele === 'c') ptt += obj.commit;else ptt += ele;
  }
  return ptt;
}

function composePattern(pattern, callback) {
  if (typeof pattern !== 'string') throw new Error('compose() -> pattern is not a string');
  pattern = pattern.split('');
  getAppVersion(function (err, obj) {
    var ptt = '';
    for (var i = 0; i < pattern.length; i++) {
      var ele = pattern[i];
      if (ele === 'M') ptt += obj.version.major;else if (ele === 'm') ptt += obj.version.minor;else if (ele === 'p') ptt += obj.version.patch;else if (ele === 's') ptt += obj.status;else if (ele === 'n') ptt += obj.build.number;else if (ele === 't') ptt += obj.build.total;else if (ele === 'd') ptt += obj.build.date;else if (ele === 'c') ptt += obj.commit;else ptt += ele;
    }
    callback(ptt);
  });
}
