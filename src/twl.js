#!/usr/bin/env node

'use strict';

/* silent install */
require('./setup.js')

/**
 * TWL Argument wrapper
 */

var twl = require('commander');
var args = process.argv.slice(2);

twl
  .version('0.0.5')
  .option('-t, --token', 'get token')

twl
  .command('start [start]')
  .description('Start twl server')
  .option('-p, --port <port>', 'set port')
  .action(function (cmd, options) {
    start(options.port)
  })

twl
  .command('add [add]')
  .description('Add project')
  .option('-n, --name <name>', 'set name')
  .option('-p, --path <path>', 'set path')
  .action(function (cmd, options) {
    add(options.name, options.path)
  })

twl
  .command('deploy [deploy]')
  .description('Deploy project')
  .option('-c, --config <config>', 'set config')
  .action(function (cmd, options) {
    deploy(options.config)
  })

twl
  .command('rollback [rollback]')
  .description('Rollback to last deploy')
  .option('-n, --name <name>', 'Project to rollback')
  .action(function (cmd, options) {
    rollback(options.name)
  })


twl.parse(process.argv);

function start(port) {
  port = port || 4711
  var server = require('./server.js')
  server.start(port)
}

function add(name, path) {
  if (!name) {
    console.log('No project name provided')
  } else if (!path) {
    console.log('No project path provided')
  } else {
    var add = require('./add.js')
    add.addProject(name, path)
  }
}

function deploy(config) {
  if (!config) {
    console.log('No config provided')
  } else {
    var client = require('./client.js')
    client.deploy(config)
  }
}

function rollback(project) {
  var serverUtils = require('./serverutils.js')
  serverUtils.rollback(project)
}

if (twl.token) {
  var server = require('./server.js')
  server.getToken()
}