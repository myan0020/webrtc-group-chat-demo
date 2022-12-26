#!/usr/bin/env node

const cp = require("child_process");
const chalk = require("chalk");

// First,
// start a express server child process for api mocking
const expressServerProcess = cp.exec("npm run express");
console.log(chalk.greenBright`express-server starts launching (for API mocking)`);

expressServerProcess.stdout.on("data", (chunk) => {
  if (chunk.substring(0, "express-server".length) === "express-server") {
    console.log(chalk.yellow(chunk));
  }

  // Second,
  // when expressServerProcess started in success,
  // start a webpack dev server child process for live previewing and public files serving
  else if (chunk.substring(0, "success".length) === "success") {
    cp.exec("npm run devServer");
    console.log(
      chalk.greenBright`dev-server starts launching (for live previewing and public files serving)`
    );
  } else {
    console.log(chunk);
  }
});
