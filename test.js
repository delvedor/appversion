/*
 * Project: appversion
 * Version: 1.2.1
 * Author: delvedor
 * Twitter: @delvedor
 * License: GNU GPLv2
 * GitHub: https://github.com/delvedor/appversion
 */

'use strict'

const test = require('tape')
const execSync = require('child_process').execSync
const exec = require('child_process').exec
const fs = require('fs')
const JSON_FILE = 'appversion.json'

test('Testing update', (t) => {
  t.plan(13)
  const original = JSON.parse(fs.readFileSync(JSON_FILE))
  let mod

  console.log('|- Testing build')
  execSync('./apv.js update build')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  let date = (new Date()).toString()
  t.equal(mod.build.number, original.build.number + 1, 'Build number was correctly updated.')
  t.equal(mod.build.total, original.build.total + 1, 'Build total was correctly updated.')
  t.equal(mod.build.date, date, 'Date was correctly updated.')

  console.log('|- Testing patch')
  execSync('./apv.js update patch')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.version.patch, original.version.patch + 1, 'Patch was correctly updated.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  console.log('|- Testing minor')
  execSync('./apv.js update minor')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.version.minor, original.version.minor + 1, 'Minor was correctly updated.')
  t.equal(mod.version.patch, 0, 'Patch was correctly reset.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  console.log('|- Testing major')
  execSync('./apv.js update major')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.version.major, original.version.major + 1, 'Major was correctly updated.')
  t.equal(mod.version.minor, 0, 'Minor was correctly reset.')
  t.equal(mod.version.patch, 0, 'Patch was correctly reset.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  console.log('|- Testing commit')
  execSync('./apv.js update commit')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  exec('git log --oneline', function (error, stdout) {
    if (error) {
      t.equal(mod.commit, null, 'Commit was correctly updated to null.')
    } else {
      t.equal(mod.commit, stdout.substring(0, 7), `Commit was correctly updated to ${stdout.substring(0, 7)}.`)
    }
  })
  // Restore JSON_FILE to the original values.
  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
})

test('Testing version', (t) => {
  t.plan(2)
  const original = JSON.parse(fs.readFileSync(JSON_FILE))
  let mod

  console.log('|- Testing version 1.2.3')
  execSync('./apv.js set-version 1.2.3')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.deepEqual(mod.version, {
    major: 1,
    minor: 2,
    patch: 3
  }, 'Version was correctly updated.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  execSync(`./apv.js set-version ${original.version.major}.${original.version.minor}.${original.version.patch}`)
  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
})

test('Testing status', (t) => {
  t.plan(8)
  const original = JSON.parse(fs.readFileSync(JSON_FILE))
  let mod

  console.log('|- Testing status stable')
  execSync('./apv.js set-status stable')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status.stage, 'stable', 'Status.stage stable was correctly updated.')
  t.equal(mod.status.number, 0, 'Status.number stable was correctly updated.')

  console.log('|- Testing status RC.1')
  execSync('./apv.js set-status RC.1')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status.stage, 'RC', 'Status.stage rc was correctly updated.')
  t.equal(mod.status.number, 1, 'Status.number rc was correctly updated.')

  console.log('|- Testing status beta.2')
  execSync('./apv.js set-status beta.2')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status.stage, 'beta', 'Status.stage beta was correctly updated.')
  t.equal(mod.status.number, 2, 'Status.number beta was correctly updated.')

  console.log('|- Testing status Alpha.0')
  execSync('./apv.js set-status Alpha.0')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status.stage, 'Alpha', 'Status.stage alpha was correctly updated.')
  t.equal(mod.status.number, 0, 'Status.number alpha was correctly updated.')
  // Restore JSON_FILE to the original values.
  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
})
