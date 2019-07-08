const fs = require('fs');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node');  // Use '@tensorflow/tfjs-node-gpu' if running with GPU
// TODO, since updating to 2.1.1, you have to import the dist - why?
const posenet = require('@tensorflow-models/posenet/dist/posenet');
const bodyPix = require('@tensorflow-models/body-pix');
global.XMLHttpRequest = require('xhr2');
const ConfigurableTransform = require('./configurable-transform');

class ImageProcessor extends ConfigurableTransform {
  constructor(params={}){
    const { streamOptions={} } = params;
    super({
      streamOptions: {
        objectMode: true,
        highWaterMark: 1,
        ...streamOptions
      },
      ...params
    });
  }
  async loadModels(){
    // slow
    // this.poseModel = await posenet.load({
    //   architecture: 'ResNet50',
    //   outputStride: 16,
    //   inputResolution: 513,
    //   quantBytes: 2
    // });

    // fast
    this.poseModel = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: 801,
      multiplier: 0.5
    });

    this.segmentationModel = await bodyPix.load(0.5);
  }

  async convertPoseToBinaryMask(pose){
    // const boundingBox =
  }

  async createTensorImgFromFile(file){
    let sharpImg = sharp(file, { failOnError: true });
    let raw = await sharpImg.raw().toBuffer({resolveWithObject:true});
    return tf.tensor3d(raw.data, [raw.info.width, raw.info.height, raw.info.channels]);
  }

  async _transform(file, encoding, done){
    try {
      if(!this.poseModel){
        await this.loadModels();
      }
      const tensorImg = await this.createTensorImgFromFile(file);

      // first generate poses
      let poses = await this.poseModel.estimateMultiplePoses(
        tensorImg,
        {
          maxDetections: 2,
          scoreThreshold: 0.5
        }
      );

      // if(!this.params.noMask){
      //   await Promise.all(
      //     poses.map(
      //       pose => {
      //         return this.convertPoseToBinaryMask(pose);
      //       }
      //     )
      //   )
      //   await this.convertPoseToBinaryMask()
      // }

      // do something with poses
      this.push(poses);
      done();
      // cleanup image, no longer needed
      tensorImg.dispose();
    }
    catch(err){
      console.error(err);
      done(err);
    }
  }
}

module.exports = ImageProcessor;
