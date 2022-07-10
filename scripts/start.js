#!/usr/bin/env node

const cp = require('child_process');
const chalk = require('chalk');

// First, 
// start a express server child process for api mocking
const expressServerProcess = cp.exec('npm run start:expressServer')
console.log(chalk.greenBright`express-server starts launching (for API mocking)`)

expressServerProcess.stdout.on('data', (chunk) => {
  if (chunk.substring(0, 'express-server'.length) !== 'express-server') {
    console.log(chunk)
    return
  }

  // Second, 
  // when expressServerProcess started in success, 
  // start a webpack dev server child process for live previewing and public files serving
  cp.exec('npm run start:devServer:expressServerProxying')
  console.log(chalk.greenBright`dev-server starts launching (for live previewing and public files serving)`)
})

// // First, 
// // start a json server child process for api mocking
// const jsonServerProcess = cp.exec('npm run start:jsonServer')
// console.log(chalk.greenBright`json-server starts launching (for API mocking)`)

// jsonServerProcess.stdout.on('data', (chunk) => {
//   if (chunk.substring(0, 'json-server'.length) !== 'json-server') {
//     console.log(chunk)
//     return
//   }

//   // Second, 
//   // when jsonServerProcess started in success, 
//   // start a webpack dev server child process for live previewing and public files serving
//   cp.exec('npm run start:devServer:jsonServerProxying')
//   console.log(chalk.greenBright`dev-server starts launching (for live previewing and public files serving)`)
// })