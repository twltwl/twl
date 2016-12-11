#! /usr/bin/env node

'use strict';

var fs = require('fs');
var crypto = require('crypto');
var path = require('path')

var dir = path.resolve(__dirname, '..', '.temp')

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

if (!fs.existsSync('./twl.config.json')) {
    var token = crypto.randomBytes(32).toString('hex');
    var defaultConf = {
        token: token,
        projects: {}
    }
    fs.writeFileSync(path.join(__dirname, '../' + 'twl.config.json'), JSON.stringify(defaultConf))
}
