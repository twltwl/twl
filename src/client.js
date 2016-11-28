#!/usr/bin/env node
 
'use strict';

var path = require('path')
var tar = require('tar-fs')
var fs = require('fs')
var request = require('request')
var Promise = require('promise');
var exec = require('child_process').exec;

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

    var cmd = 'curl -i -F filedata=@' + getFilename(config) + ' ' + config.url + '/deploy/' + config.token + '/' + config.name
    exec(cmd, function(error, stdout, stderr) {
      console.log(stderr)
      if(!error){
        resolve(config)
      } else {
        reject()
      }
    });

  })
}

function remove(config){
  fs.unlinkSync(getFilename(config));
  console.log('Deploy complete')
}

module.exports = {
  deploy : function(c) {
    var config = require(path.join(process.cwd(), c))
    createArtifact(config)
      .then(send)
      .then(remove)
  }
}