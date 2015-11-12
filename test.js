'use strict'

/*
 * Project: appversion
 * Version: 1.1.0
 * Author: delvedor
 * Twitter: @delvedor
 * License: GNU GPLv2
 * GitHub: https://github.com/delvedor/appversion
 */

let test = require('tape')
let execSync = require('child_process').execSync
let fs = require('fs')
const JSON_FILE = 'appversion.json'

test('Testing update', (t) => {
  t.plan(12)
  let original = JSON.parse(fs.readFileSync(JSON_FILE))
  let mod

  console.log('|- Testing patch')
  execSync('./cli.js update patch')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.version.patch, original.version.patch + 1, 'Patch was correctly updated.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  console.log('|- Testing minor')
  execSync('./cli.js update minor')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.version.minor, original.version.minor + 1, 'Minor was correctly updated.')
  t.equal(mod.version.patch, 0, 'Patch was correctly reset.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  console.log('|- Testing major')
  execSync('./cli.js update major')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.version.major, original.version.major + 1, 'Major was correctly updated.')
  t.equal(mod.version.minor, 0, 'Minor was correctly reset.')
  t.equal(mod.version.patch, 0, 'Patch was correctly reset.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  console.log('|- Testing build')
  execSync('./cli.js update build')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  let date = new Date()
  t.equal(mod.build.number, original.build.number + 1, 'Build number was correctly updated.')
  t.equal(mod.build.total, original.build.total + 1, 'Build total was correctly updated.')
  t.equal(mod.build.date, `${date.getFullYear()}.${date.getMonth() + 1 }.${date.getDate()}`, 'Date was correctly updated.')

  console.log('|- Testing commit')
  console.log('|-- Test not yet implemented')

  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
})

test('Testing version', (t) => {
  t.plan(2)
  let original = JSON.parse(fs.readFileSync(JSON_FILE))
  let mod

  console.log('|- Testing version "1.2.3"')
  execSync('./cli.js version "1.2.3"')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.deepEqual(mod.version, {
    major: 1,
    minor: 2,
    patch: 3
  }, 'Version was correctly updated.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
})

test('Testing status', (t) => {
  t.plan(4)
  let original = JSON.parse(fs.readFileSync(JSON_FILE))
  let mod

  console.log('|- Testing status "stable"')
  execSync('./cli.js status "stable"')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status, 'stable', 'Status "stable" was correctly updated.')

  console.log('|- |- Testing status "rc"')
  execSync('./cli.js status "rc"')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status, 'rc', 'Status "rc" was correctly updated.')

  console.log('|- Testing status "beta"')
  execSync('./cli.js status "beta"')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status, 'beta', 'Status "beta" was correctly updated.')

  console.log('|- Testing status "alpha"')
  execSync('./cli.js status "alpha"')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status, 'alpha', 'Status "alpha" was correctly updated.')

  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
})
