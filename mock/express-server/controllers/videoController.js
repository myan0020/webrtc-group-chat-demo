const mime = require("mime");
const fs = require("fs");
const chalk = require("chalk");
const path = require('path')
const videoProcessor = require("../media-processing/videoProcessor");

/**
 * Clip and send a video based on the range in seconds
 */

exports.getVideoClip = (req, res, next) => {
  const videoId = req.query.id;
  const range = req.query.rangeInSeconds;
  const regxResult = /(\d+)\-(\d+)/g.exec(range);
  const rangeStart = regxResult[1];
  const rangeEnd = regxResult[2];

  if (regxResult && rangeStart.length > 0 && rangeEnd.length > 0) {
    const rangeInSeconds = {
      start: parseInt(rangeStart),
      end: parseInt(rangeEnd),
    };
    videoProcessor.videoId = videoId;
    videoProcessor.startInSeconds = rangeInSeconds.start;
    videoProcessor.durationInSeconds =
      rangeInSeconds.end - rangeInSeconds.start;
    videoProcessor.endCallback = (outputFileName) => {
      fs.stat(outputFileName, (error, states) => {
        if (error) next(error);
        res.set({
          "Content-Type": mime.getType(outputFileName),
          "Content-Length": states.size,
          "Cache-Control": "no-caches",
        });
        res.status(200);
        const readableStream = fs.createReadStream(outputFileName);
        readableStream.on("close", () => {
          fs.unlink(outputFileName, (err) => {
            if (err) next(err);
            console.log(
              chalk.green(`\n${outputFileName}`),
              " was ",
              chalk.green("deleted")
            );
          });
        });
        readableStream.pipe(res);
      });
    };
    videoProcessor.run();
  }
};

/**
 * Use HLS protocol to send a video
 */

exports.getVideoHLS = (req, res, next) => {
  const hlsID = req.query.id;

  const regxResult = /([\w-]+)\.(\w+)/g.exec(hlsID);
  let hlsFileName = `${path.resolve(__dirname, "../resource/video/hls", regxResult[1])}`
  switch(regxResult[2]) {
    case 'm3u8':
      hlsFileName += '.m3u8'
      break;
    case 'ts':
      hlsFileName += '.ts'
      break;
    default:
      // code block
  }

  const type  = mime.getType(hlsFileName);

  fs.readFile(hlsFileName, (err, data) => {
    if (err) next(err);
    res.set({
      "Content-Type": type,
    });
    res.send(data);
  });
}
