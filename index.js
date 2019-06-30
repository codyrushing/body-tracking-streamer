const VideoReader = require('./lib/video-reader');
const { manageProcess } = require('./lib/util');

(async function(){
  const videoReader = new VideoReader({
    src: './demo-video/professor.mp4'
  });

  await videoReader.decode();

  manageProcess(
    process,
    {
      cleanup: () => {
        if(videoReader){
          videoReader.destroy();
        };
      }
    }
  );

  if(videoReader.frameStream){
    videoReader.frameStream
      .on(
        'data',
        console.log
      );
  }

})();
