#!/usr/bin/env node
 
'use strict';

var path = require('path')
var tar = require('tar-fs')
var fs = require('fs')
var request = require('request')
var Promise = require('promise');

function getFilename (config) {
  return path.join(process.cwd(), config.name + '-artifact.tar')
}

function createArtifact (config) {
  return new Promise(function (resolve, reject) {
    tar
      .pack(path.join(process.cwd(), config.directory))
      .pipe(fs.createWriteStream(getFilename(config)))
      .on('finish', function(){ resolve(config) });
    
    console.log('Built artifact...')
  })
}

function send(config) {
  return new Promise(function (resolve, reject) {
    var req = request.post(config.url + '/deploy/' + config.token + '/' + config.name, function (err, resp, body) {
      if (err) {
        console.log('Error deploying', err);
        reject()
      } else {
        console.log('Success');
        resolve(config)
      }
    })
    var form = req.form()
    form.append('file', fs.createReadStream(getFilename(config)))
  })
}

function remove(config){
  fs.unlinkSync(getFilename(config));
}

module.exports = {
  deploy : function(c) {
    var config = require(path.join(process.cwd(), c))
    createArtifact(config)
      .then(send)
      .then(remove)
  }
}