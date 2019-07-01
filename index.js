const VideoReader = require('./lib/video-reader');
const ImageProcessor = require('./lib/image-processor');
const { manageProcess } = require('./lib/util');

(async function(){
  const videoReader = new VideoReader({
    src: './demo-video/professor.mp4'
  });

  await videoReader.decode();

  videoReader
    .pipe(
      new ImageProcessor({
        objectMode: true,
        highWaterMark: 1
      })
    );

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

})();
