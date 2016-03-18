/*
 * Project: appversion
 * Version: 1.5.2
 * Author: delvedor
 * Twitter: @delvedor
 * License: MIT
 * GitHub: https://github.com/delvedor/appversion
 */

'use strict'

// Modules
const test = require('tape')
const execSync = require('child_process').execSync
const exec = require('child_process').exec
const fs = require('fs')
const chalk = require('chalk')
// apv parameters and functions
const apv = require('./appversion')
const JSON_FILE = 'appversion.json'

test(chalk.cyan.bold('Testing update'), (t) => {
  t.plan(13)
  const original = JSON.parse(fs.readFileSync(JSON_FILE))
  const readme = fs.readFileSync('README.md', 'utf8')
  let mod

  console.log(chalk.cyan('|- Testing build'))
  execSync('./apv.js update build')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.build.number, original.build.number + 1, 'Build number was correctly updated.')
  t.equal(mod.build.total, original.build.total + 1, 'Build total was correctly updated.')
  t.equal(!!Date.parse(mod.build.date), true, 'Date was correctly updated.')

  console.log(chalk.cyan('|- Testing patch'))
  execSync('./apv.js update patch')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.version.patch, original.version.patch + 1, 'Patch was correctly updated.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  console.log(chalk.cyan('|- Testing minor'))
  execSync('./apv.js update minor')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.version.minor, original.version.minor + 1, 'Minor was correctly updated.')
  t.equal(mod.version.patch, 0, 'Patch was correctly reset.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  console.log(chalk.cyan('|- Testing major'))
  execSync('./apv.js update major')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.version.major, original.version.major + 1, 'Major was correctly updated.')
  t.equal(mod.version.minor, 0, 'Minor was correctly reset.')
  t.equal(mod.version.patch, 0, 'Patch was correctly reset.')
  t.equal(mod.build.number, 0, 'Build number was correctly reset.')

  console.log(chalk.cyan('|- Testing commit'))
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

test(chalk.cyan.bold('Testing version'), (t) => {
  t.plan(2)
  const original = JSON.parse(fs.readFileSync(JSON_FILE))
  const readme = fs.readFileSync('README.md', 'utf8')
  let mod

  console.log(chalk.cyan('|- Testing version 1.2.3'))
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

test(chalk.cyan.bold('Testing status'), (t) => {
  t.plan(8)
  const original = JSON.parse(fs.readFileSync(JSON_FILE))
  const readme = fs.readFileSync('README.md', 'utf8')
  let mod

  console.log(chalk.cyan('|- Testing status stable'))
  execSync('./apv.js set-status stable')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status.stage, 'stable', 'Status.stage stable was correctly updated.')
  t.equal(mod.status.number, 0, 'Status.number stable was correctly updated.')

  console.log(chalk.cyan('|- Testing status RC.1'))
  execSync('./apv.js set-status RC.1')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status.stage, 'RC', 'Status.stage rc was correctly updated.')
  t.equal(mod.status.number, 1, 'Status.number rc was correctly updated.')

  console.log(chalk.cyan('|- Testing status beta.2'))
  execSync('./apv.js set-status beta.2')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status.stage, 'beta', 'Status.stage beta was correctly updated.')
  t.equal(mod.status.number, 2, 'Status.number beta was correctly updated.')

  console.log(chalk.cyan('|- Testing status Alpha.0'))
  execSync('./apv.js set-status Alpha.0')
  mod = JSON.parse(fs.readFileSync(JSON_FILE))
  t.equal(mod.status.stage, 'Alpha', 'Status.stage alpha was correctly updated.')
  t.equal(mod.status.number, 0, 'Status.number alpha was correctly updated.')
  // Restore JSON_FILE to the original values.
  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
  fs.writeFileSync('README.md', readme)
})

test(chalk.cyan.bold('Testing badge'), (t) => {
  t.plan(4)
  const readme = fs.readFileSync('README.md', 'utf8')
  const packagejson = fs.readFileSync('package.json', 'utf8')
  const original = JSON.parse(fs.readFileSync(JSON_FILE))

  console.log(chalk.cyan('|- Testing update version md file'))
  execSync('./apv.js set-version 1.2.3')
  let readmeMod = fs.readFileSync('README.md', 'utf8')
  let url = 'https://img.shields.io/badge/AppVersion-1.2.3-brightgreen.svg?style=flat'
  let readmeExpected = `${readmeMod.substring(0, readmeMod.indexOf('[![AppVersion-version]'))}[![AppVersion-version](${url})]${readmeMod.substring(readmeMod.indexOf('(https://github.com/delvedor/appversion?#version)'))}`
  t.equal(readmeMod, readmeExpected, 'Update version badge works correctly!')

  console.log(chalk.cyan('|- Testing update status md file'))
  execSync('./apv.js set-status beta.2')
  readmeMod = fs.readFileSync('README.md', 'utf8')
  url = 'https://img.shields.io/badge/Status-beta%202-brightgreen.svg?style=flat'
  readmeExpected = `${readmeMod.substring(0, readmeMod.indexOf('[![AppVersion-status]'))}[![AppVersion-status](${url})]${readmeMod.substring(readmeMod.indexOf('(https://github.com/delvedor/appversion?#status)'))}`
  t.equal(readmeMod, readmeExpected, 'Update status badge works correctly!')

  console.log(chalk.cyan('|- Testing generate-badge version'))
  exec('./apv.js generate-badge version', (err, stdout) => {
    if (err) console.log(err)
    let url = `https://img.shields.io/badge/AppVersion-${original.version.major}.${original.version.minor}.${original.version.patch}-brightgreen.svg?style=flat`
    let readmeCode = `[![AppVersion-version](${url})](https://github.com/delvedor/appversion?#version)`
    let expectedOutput = `\nAppVersion: version badge generated!

${readmeCode}
  \n`
    t.equal(stdout, expectedOutput, 'Generate version badge works correctly!')
  })

  console.log(chalk.cyan('|- Testing generate-badge status'))
  exec('./apv.js generate-badge status', (err, stdout) => {
    if (err) console.log(err)
    let status = original.status.number > 0 ? `${original.status.stage}%20${original.status.number}` : original.status.stage
    let url = `https://img.shields.io/badge/Status-${status}-brightgreen.svg?style=flat`
    let readmeCode = `[![AppVersion-status](${url})](https://github.com/delvedor/appversion?#status)`
    let expectedOutput = `\nAppVersion: status badge generated!

${readmeCode}
  \n`
    t.equal(stdout, expectedOutput, 'Generate status badge works correctly!')
  })
  // Restore JSON_FILE and README.md to the original values
  fs.writeFileSync('README.md', readme)
  fs.writeFileSync(JSON_FILE, JSON.stringify(original, null, 2) + '\n')
  // Restore package.json
  fs.writeFileSync('package.json', packagejson)
})

test(chalk.cyan.bold('Testing appversion.js'), (t) => {
  t.plan(4)
  const original = JSON.parse(fs.readFileSync(JSON_FILE))
  const obj = {
    version: original.version,
    status: original.status,
    build: original.build,
    commit: original.commit
  }
  const ptt = `${original.version.major}.${original.version.minor}.${original.version.patch}.${original.status.stage}.${original.status.number}.${original.build.number}.${original.build.total}.${original.build.date}.${original.commit}`

  console.log(chalk.cyan('|- Testing appversion.getAppVersionSync'))
  t.deepEqual(apv.getAppVersionSync(), obj, 'appversion.getAppVersionSync works correctly!')

  console.log(chalk.cyan('|- Testing appversion.composePatternSync'))
  t.equal(apv.composePatternSync('M.m.p.S.s.n.t.d.c'), ptt, 'appversion.composePatternSync works correctly!')

  console.log(chalk.cyan('|- Testing appversion.getAppVersion'))
  apv.getAppVersion((err, data) => {
    if (err) console.log(err)
    t.deepEqual(data, obj, 'appversion.getAppVersion works correctly!')
  })

  console.log(chalk.cyan('|- Testing appversion.composePattern'))
  apv.composePattern('M.m.p.S.s.n.t.d.c', (data) => {
    t.equal(data, ptt, 'appversion.composePattern works correctly!')
  })
})
