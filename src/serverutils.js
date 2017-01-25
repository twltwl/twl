#! /usr/bin/env node

'use strict';

var config = require('../twl.config.json')
var path = require('path')
var tar = require('tar-fs')

function rollback(name) {
  var project = config.projects[name]
  if (!project) {
    console.log('Invalid project')
  } else {
    checkBackup()
      .then(cleanDir)
      .then(restore)
  }
}

function checkBackup(project) {
  return new Promise(function (resolve, reject) {
    var backup = path.join(__dirname, '../.temp/', project.name, '-artifact.tar.backup')
    path.exists(backup, function (exists) {
      if (exists) {
        resolve({ project: project, backup: backup })
      } else {
        console.log('Could not find a backup file')
        reject()
      }
    })
  })
}

function clearDir(args) {
  return new Promise(function (resolve, reject) {
    fs.emptyDir(args.project.path, function (e) {
      resolve(args)
    })
  })
}

function restore(aergs) {
  fs.createReadStream(args.backup).pipe(tar.extract(args.project.path, { dmode: '0555', fmode: '0444' }))
}

module.exports = {
  rollback: rollback
}

