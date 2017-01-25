#! /usr/bin/env node

'use strict';

var config = require('../twl.config.json')
var path = require('path')
var fs = require('fs-extra')
var tar = require('tar-fs')

function checkBackup(project, name) {
  return new Promise(function (resolve, reject) {
    var backup = path.join(__dirname, '../.temp/', name + '.tar.backup')
    fs.stat(backup, function (err, stats) {
      if (!err) {
        resolve({ project: project, backup: backup })
      } else {
        console.log('Could not find a backup file!')
        reject()
      }
    })
  })
}

function clearDir(args) {
  return new Promise(function (resolve, reject) {
    fs.emptyDir(args.project.path, function (e) {
      if (!e) {
        resolve(args)
      } else {
        reject()
      }
    })
  })
}

function restore(args) {
  fs.createReadStream(args.backup).pipe(tar.extract(args.project.path, { dmode: '0555', fmode: '0444' }))
  console.log('Rollback complete.')
}

function rollback(name) {
  var project = config.projects[name]
  if (!project) {
    console.log('Invalid project')
  } else {
    checkBackup(project, name)
      .then(clearDir)
      .then(restore)
  }
}

module.exports = {
  rollback: rollback
}

