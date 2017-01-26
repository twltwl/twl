#! /usr/bin/env node

'use strict';

var express = require('express')
var fs = require('fs-extra')
var busboy = require("connect-busboy")
var config = require('../../twl.config.json')
var tar = require('tar-fs')
var path = require('path')
var Promise = require('promise')
var cluster = require('cluster')

function startWebserver(port) {
  var app = express()

  app.use(busboy());

  app.get('/', function (req, res) {
    res.send('im alive!')
  })

  app.post('/deploy/:token/:project', function (req, res) {
    if (req.params.token !== config.token) {
      res.send('Invalid token')
    } else if (!config.projects[req.params.project]) {
      res.send('Invalid project')
    } else {
      var project = config.projects[req.params.project]
      req.pipe(req.busboy)

      req.busboy.on('file', function (fieldname, file, filename) {
        if (filename.match(/^.*\.tar$/)) {
          saveFile(file, filename, project)
            .then(rotate)
            .then(clearDir)
            .then(moveFile)
          res.send('Deploy successful')
        } else {
          res.send('Wrong file format')
        }
      })

    }
  })

  app.listen(port, function () {
    console.log('Deploy worker running on port :' + port + '\ndeploy token : ' + config.token)
  })
}

function rotate(args) {
  return new Promise(function (resolve, reject) {
    try {
      var backup = path.join(__dirname, '../.temp/' + args.filename + '.backup');
      var active = path.join(__dirname, '../.temp/' + args.filename + '.active');
      var temp = path.join(__dirname, '../.temp/' + args.filename + '.temp');

      var rotateActive = function () {
        fs.stat(active, function (err, stats) {
          if (!err) {
            fs.rename(active, backup, function () {
              rotateTemp()
            })
          } else {
            rotateTemp()
          }
        })
      }

      var rotateTemp = function () {
        fs.rename(temp, active, function () {
          resolve(args)
        })
      }

      fs.stat(backup, function (err, stats) {
        if (!err) {
          fs.unlink(backup, function () {
            rotateActive()
          })
        } else {
          rotateActive()
        }
      })

    } catch (e) {
      console.log(e)
      reject()
    }

  })

}

function saveFile(file, filename, project) {
  return new Promise(function (resolve, reject) {
    var _file = path.join(__dirname, '../.temp/' + filename + '.temp');
    var fstream = fs.createWriteStream(_file);
    file.pipe(fstream);
    fstream.on('close', function () {
      resolve({ project: project, filename: filename })
    });
  })
}

function clearDir(args) {
  return new Promise(function (resolve, reject) {
    fs.emptyDir(args.project.path, function (e) {
      resolve(args)
    })
  })
}

function moveFile(args) {
  return new Promise(function (resolve, reject) {
    var fileToMove = path.join(__dirname, '../.temp/' + args.filename + '.active');
    fs.createReadStream(fileToMove).pipe(tar.extract(args.project.path, { dmode: '0555', fmode: '0444' }))
    resolve()
  })
}

function init(port) {

  if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length
    for (var i = 0; i < cpuCount; i++) {
      cluster.fork()
    }
  } else {
    startWebserver(port)
  }

  cluster.on('exit', function (worker) {
    cluster.fork()
  })

}

module.exports = {
  start: function (port) {
    init(port)
  },

  getToken: function () {
    console.log(config.token)
  }
}
