#! /usr/bin/env node

'use strict';

var fs = require('fs');
var crypto = require('crypto');
var path = require('path')

console.log('Installing...')

var dir = './.temp';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    console.log('created temp folder...')
}

if (!fs.existsSync('./twl.config.json')) {
    var token = crypto.randomBytes(32).toString('hex');
    var defaultConf = {
        token: token,
        projects: {}
    }
    fs.writeFileSync(path.join(__dirname, '../' + 'twl.config.json'), JSON.stringify(defaultConf))

    console.log('created config...')
    console.log('deploy token: ' + token)
}
