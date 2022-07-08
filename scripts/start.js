#!/usr/bin/env node

const cp = require('child_process');

// First, 
// start a json server child process for local api mocking
const jsonServerProcess = cp.exec('npm run start:jsonServer')
console.log('json-server starts lanuching')

jsonServerProcess.stdout.on('data', (chunk) => {
  if (chunk.substring(0, 11) !== 'json-server') {
    console.log(chunk)
    return
  }

  // Second, 
  // when jsonServerProcess started in success, 
  // start a webpack dev server child process for public files serving
  cp.exec('npm run start:devServer:proxying')
  console.log('dev-server starts lanuching')
})