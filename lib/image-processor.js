const { Transform } = require('stream');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node');  // Use '@tensorflow/tfjs-node-gpu' if running with GPU
const posenet = require('@tensorflow-models/posenet')
global.XMLHttpRequest = require('xhr2')

class ImageProcessor extends Transform {
  async loadModels(){
    this.net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: 513,
      multiplier: 0.75
    });
  }
  async _write(file, encoding, done){
    console.log(file);
    try {
      if(!this.net){
        await this.loadModels();
      }
      let sharpImg = sharp(file, { failOnError: true });
      let raw = await sharpImg.raw().toBuffer({resolveWithObject:true});
      let imgTensor = tf.tensor3d(raw.data, [raw.info.width, raw.info.height, raw.info.channels]);
      let pose = await this.net.estimateMultiplePoses(imgTensor);
      // do something with pose
    }
    catch(err){
      console.error(err);
    }
    done();
  }
}

module.exports = ImageProcessor;
