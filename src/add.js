#!/usr/bin/env node

'use strict'

var fs = require('fs')
var path = require('path')

var config = require('../../twl.config.json')

module.exports = {
  addProject: function (name, _path) {
    config.projects[name] = { path: _path }
    fs.writeFile(path.join(__dirname, '../' + 'twl.config.json'), JSON.stringify(config), function (err) {
      if (err) {
        return console.log(err);
      }

      console.log('Updated config...')
    });
  }
}