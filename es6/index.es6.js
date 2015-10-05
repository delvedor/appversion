import {
  readFileSync, readFile
}
from 'fs';
import {
  resolve
}
from 'path';
import {
  platform
}
from 'os';

const JSON_FILE = 'appversion.json';
let slash;
if (platform() === 'darwin')
  slash = '/';
else
  slash = '\\';
let dir = resolve(__dirname).split(`${slash}node_modules`)[0];

export function getAppVersionSync() {
  try {
    let obj = JSON.parse(readFileSync(`${dir}${slash}${JSON_FILE}`));
    delete obj.json;
    return obj;
  } catch (err) {
    throw new Error(`${JSON_FILE} not found.`);
  }
}

export function getAppVersion(callback) {
  readFile(`${dir}${slash}${JSON_FILE}`, (err, data) => {
    data = JSON.parse(data);
    if (data)
      delete data.json;
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
export function composePatternSync(pattern) {
  if (typeof pattern !== 'string')
    throw new Error('compose() -> pattern is not a string');
  pattern = pattern.split('');
  let obj = getAppVersionSync();
  let ptt = '';
  for (let i = 0; i < pattern.length; i++) {
    let ele = pattern[i];
    if (ele === 'M')
      ptt += obj.version.major;
    else if (ele === 'm')
      ptt += obj.version.minor;
    else if (ele === 'p')
      ptt += obj.version.patch;
    else if (ele === 's')
      ptt += obj.status;
    else if (ele === 'n')
      ptt += obj.build.number;
    else if (ele === 't')
      ptt += obj.build.total;
    else if (ele === 'd')
      ptt += obj.build.date;
    else if (ele === 'c')
      ptt += obj.commit;
    else
      ptt += ele;
  }
  return ptt;
}

export function composePattern(pattern, callback) {
  if (typeof pattern !== 'string')
    throw new Error('compose() -> pattern is not a string');
  pattern = pattern.split('');
  getAppVersion(function(err, obj) {
    let ptt = '';
    for (let i = 0; i < pattern.length; i++) {
      let ele = pattern[i];
      if (ele === 'M')
        ptt += obj.version.major;
      else if (ele === 'm')
        ptt += obj.version.minor;
      else if (ele === 'p')
        ptt += obj.version.patch;
      else if (ele === 's')
        ptt += obj.status;
      else if (ele === 'n')
        ptt += obj.build.number;
      else if (ele === 't')
        ptt += obj.build.total;
      else if (ele === 'd')
        ptt += obj.build.date;
      else if (ele === 'c')
        ptt += obj.commit;
      else
        ptt += ele;
    }
    callback(ptt);
  });
}
