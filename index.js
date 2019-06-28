const VideoReader = require('./lib/video-reader');

(async function(){
  const videoReader = new VideoReader({
    src: './demo-video/professor.mp4'
  });

  await videoReader.decode();

  if(videoReader.frameStream){
    videoReader.frameStream
      .on(
        'data',
        console.log
      );
  }

})();
