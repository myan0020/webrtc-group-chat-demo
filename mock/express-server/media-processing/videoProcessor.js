const path = require("path");

let videoId = 'sintel.mp4';
let startCallback = () => {};
let errorCallback = (error) => {};
let endCallback = (outputFileName) => {};
let startInSeconds = 0;
let durationInSeconds = 10;

const videoInputPath = `${path.resolve(__dirname, "../resource/video")}`;
const imageInputPath = `${path.resolve(__dirname, "../resource/image")}`;
const videoOutputPath = `${path.resolve(__dirname, "../resource/video/tmp")}`;
const imageOutputPath = `${path.resolve(__dirname, "../resource/image/tmp")}`;

const fs = require('fs');
const chalk = require("chalk");
const ffmpeg = require("fluent-ffmpeg");

function run() {
  ffmpeg()
  .input(path.resolve(videoInputPath, "sintel.mp4"))
  .seekInput(this.startInSeconds)
  .withDuration(this.durationInSeconds)
  .on("start", function (commandLine) {
    if (!fs.existsSync(videoOutputPath)) {
      console.log(chalk.yellow(`Checking ffmpeg output directory: ${videoOutputPath} does not exist` + '\n'))
      fs.mkdirSync(videoOutputPath);
      console.log(chalk.white(`Ffmpeg output directory is now created as ${videoOutputPath}` + '\n'))
    }
    console.log(chalk.white("Spawned Ffmpeg with command: " + commandLine + '\n'));
    // this.startCallback();
  })
  .on("error", function (err) {
    console.log(chalk.red("An error occurred: " + err.message));
    // this.errorCallback(err)
  })
  .on("end", () => {
    console.log(chalk.green(`Ffmpeg works done successfully! Please check to see the output file at ${videoOutputPath}` + '\n'));
    this.endCallback(path.resolve(videoOutputPath, `${this.videoId}`))
  })
  .save(path.resolve(videoOutputPath, `${this.videoId}`));
}

exports.startCallback = startCallback;
exports.errorCallback = errorCallback;
exports.endCallback = endCallback;
exports.videoId = videoId;
exports.videoInputPath = videoInputPath;
exports.imageInputPath = imageInputPath;
exports.videoOutputPath = videoOutputPath;
exports.imageOutputPath = imageOutputPath;
exports.startInSeconds = startInSeconds;
exports.durationInSeconds = durationInSeconds;
exports.run = run;
