const path = require('path');
const { Transform } = require('stream');
const VideoReader = require('./lib/video-reader');
const ImageProcessor = require('./lib/image-processor');
const { DEMO_VIDEO } = require('./config');

module.exports = async function(){
  const videoReader = new VideoReader({
    src: path.join(__dirname, DEMO_VIDEO)
  });
  const imageProcessor = new ImageProcessor();

  const pipeline = videoReader
    .pipe(
      imageProcessor
    )
    .pipe(
      new Transform({
        objectMode: true,
        transform: (poses, encoding, done) => {
          // console.log(
          //   poses.map(pose => pose.keypoints.map(k => k.position))
          // );
          done();
        }
      })
    );

  // start decoding
  await videoReader.decode();

  return {
    pipeline,
    videoReader,
    imageProcessor
  };

}
