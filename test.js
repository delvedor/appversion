/*
 * Project: appversion
 * Version: 1.3.0
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
  const readme = fs.readFileSync('README.md', 'utf8')
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
  exec('git log --oneline', function (err, stdout) {
    if (err) {
      t.equal(mod.commit, null, 'Commit was correctly updated to null.')
    } else {
      t.equal(mod.commit, stdout.substring(0, 7), `Commit was correctly updated to ${stdout.substring(0, 7)}.`)
    }
  })
  // Restore JSON_FILE to the original values.
  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
  fs.writeFileSync('README.md', readme)
})

test('Testing version', (t) => {
  t.plan(2)
  const original = JSON.parse(fs.readFileSync(JSON_FILE))
  const readme = fs.readFileSync('README.md', 'utf8')
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
  fs.writeFileSync('README.md', readme)
})

test('Testing status', (t) => {
  t.plan(8)
  const original = JSON.parse(fs.readFileSync(JSON_FILE))
  const readme = fs.readFileSync('README.md', 'utf8')
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
  fs.writeFileSync('README.md', readme)
})

test('Testing badge', (t) => {
  t.plan(4)
  const readme = fs.readFileSync('README.md', 'utf8')
  const original = JSON.parse(fs.readFileSync(JSON_FILE))

  console.log('|- Testing update version md file')
  execSync('./apv.js set-version 1.2.3')
  let readmeMod = fs.readFileSync('README.md', 'utf8')
  let url = 'https://img.shields.io/badge/AppVersion-1.2.3-brightgreen.svg?style=flat'
  let readmeExpected = `${readmeMod.substring(0, readmeMod.indexOf('[![AppVersion-version]'))}[![AppVersion-version](${url})]${readmeMod.substring(readmeMod.indexOf('(https://github.com/delvedor/appversion?#version)'))}`
  t.equal(readmeMod, readmeExpected, 'Update version badge works correctly!')

  console.log('|- Testing update status md file')
  execSync('./apv.js set-status beta.2')
  readmeMod = fs.readFileSync('README.md', 'utf8')
  url = 'https://img.shields.io/badge/Status-beta%202-brightgreen.svg?style=flat'
  readmeExpected = `${readmeMod.substring(0, readmeMod.indexOf('[![AppVersion-status]'))}[![AppVersion-status](${url})]${readmeMod.substring(readmeMod.indexOf('(https://github.com/delvedor/appversion?#status)'))}`
  t.equal(readmeMod, readmeExpected, 'Update status badge works correctly!')

  console.log('|- Testing generate-version-badge')
  exec('./apv.js generate-version-badge', (err, stdout) => {
    if (err) console.log(err)
    let url = `https://img.shields.io/badge/AppVersion-${original.version.major}.${original.version.minor}.${original.version.patch}-brightgreen.svg?style=flat`
    let readmeCode = `[![AppVersion-version](${url})](https://github.com/delvedor/appversion?#version)`
    let expectedOutput = `Version badge generated!

${readmeCode}

  \n`
    t.equal(stdout, expectedOutput, 'Generate version badge works correctly!')
  })

  console.log('|- Testing generate-status-badge')
  exec('./apv.js generate-status-badge', (err, stdout) => {
    if (err) console.log(err)
    let status = original.status.number > 0 ? `${original.status.stage}%20${original.status.number}` : original.status.stage
    let url = `https://img.shields.io/badge/Status-${status}-brightgreen.svg?style=flat`
    let readmeCode = `[![AppVersion-status](${url})](https://github.com/delvedor/appversion?#status)`
    let expectedOutput = `Status badge generated!

${readmeCode}

  \n`
    t.equal(stdout, expectedOutput, 'Generate status badge works correctly!')
  })
  // Restore JSON_FILE and README.md to the original values
  fs.writeFileSync('README.md', readme)
  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
})
