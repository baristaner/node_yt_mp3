const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');
const sanitize = require("sanitize-filename");
const readlineSync = require('readline-sync');

const videoUrl = readlineSync.question('Enter YouTube video URL: ');
const stream = ytdl(videoUrl, { filter: 'audioonly' });

stream.on('info', function(info) {
  const title = sanitize(info.videoDetails.title);
  const outputName = `${title}.mp3`;

  const options = [
    '-i', 'pipe:0',
    '-f', 'mp3',
    '-ab', '128k',
    '-ac', '2',
    '-ar', '44100',
    '-map', 'a',
    '-id3v2_version', '3',
    '-metadata', `title="${title}"`,
    '-metadata', `artist="My Custom Artist"`,
    '-metadata', `album="My Custom Album"`,
    '-metadata', `date="2023"`,
    outputName
  ];

  const ffmpegProcess = require('child_process').spawn(ffmpeg, options);

  stream.on('data', function(chunk) {
    ffmpegProcess.stdin.write(chunk);
  });

  stream.on('end', function() {
    ffmpegProcess.stdin.end();
  });

  ffmpegProcess.on('close', function() {
    console.log('Conversion finished!');
  });
});
