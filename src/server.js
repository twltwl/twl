#! /usr/bin/env node

'use strict';

var express = require('express')
var fs = require('fs-extra')
var app = express()
var busboy = require("connect-busboy");
var config = require('../twl.config.json')
var tar = require('tar-fs')
var path = require('path')

app.use(busboy());

app.post('/deploy/:token/:project', function(req, res) {
    if(req.params.token !== config.token){
      res.send('Invalid token')
    } else if(!config.projects[req.params.project]) {
      res.send('Invalid project')
    } else {
      var project = config.projects[req.params.project]
      req.pipe(req.busboy)

      req.busboy.on('file', function(fieldname, file, filename) {
        if(filename.match(/^.*\.tar$/)){
          saveFile(file, filename, project)
          res.send('Deploy successful')
        } else {
          res.send('Wrong file format')
        }
      })

    }
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('500 Internal server error!')
})

function saveFile(file, filename, project){
  var _file = path.join(path.join(__dirname, '../.temp/' + Date.now() + '-' + filename));
  var fstream = fs.createWriteStream(_file); 
  file.pipe(fstream);
  fstream.on('close', function () {
      moveFile(_file, project)
  });
}

function moveFile(file, project){
  fs.emptyDirSync(project.path)
  fs.createReadStream(file).pipe(tar.extract(project.path, {dmode: '0555', fmode : '0444'}))
  deleteFile(file)
}

function deleteFile(file) {
  fs.unlinkSync(file);
}

module.exports = {
  start : function(port) {
    app.listen(port, function () {
      console.log('Deploy server running on port :' + port + '\ndeploy token : ' + config.token)
    })
  },

  getToken : function(){
    console.log(config.token)
  }
}
