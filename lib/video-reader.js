const os = require('os');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { Duplex } = require('stream');
const rimraf = require('rimraf');

const mkdtemp = promisify(fs.mkdtemp);

class FrameStream extends Duplex {
  constructor(params){
    const { streamOptions={} } = params;
    super({
      objectMode: true,
      ...streamOptions
    });
    this.params = params;
    this.init();
  }
  read(data){
    this.push(data);
  }
  init(){
    const { dir } = this.params;
    if(dir){
      fs.watch(
        dir,
        (type, file) => {
          if(type === 'change'){
            this.write(path.join( dir, file));
          }
        }
      )
    }
  }
}

class VideoReader {
  constructor(params){
    this.params = params;
    this.destroy = this.destroy.bind(this);
    this.init();
  }
  init(){
    // do stuff here
    process.on(
      'exit',
      this.destroy
    );
    process.on(
      'uncaughtException',
      this.destroy
    );
    process.on(
      'SIGINT',
      this.destroy
    );
  }
  async decode(){
    const { src } = this.params;
    if(!src) {
      return;
    }
    if(this.decoderProcess){
      this.decoderProcess.kill(1);
    }
    if(this.frameStream){
      this.frameStream.destroy();
    }

    this.framesDir = await mkdtemp(
      path.join(os.tmpdir(), `${path.basename(src, path.extname(src))}-`)
    );

    this.decoderProcess = execFile(
      'ffmpeg',
      [
        '-re',
        '-i', src,
        // 'eq=' + Object.entries(this.videoFilters).map(([key,val])=> `${key}=${val}`).join(':'),
        path.join(this.framesDir, 'frame-%06d.png')
      ]
    );

    // initialize a stream that emits frame paths
    this.frameStream = new FrameStream({
      streamOptions: { objectMode: true },
      dir: this.framesDir
    });
  }
  destroy(code){
    console.log(code);
    console.log('\n');
    if(this.decoderProcess){
      console.log('Cleaning up decoder process');
      this.decoderProcess.kill(1);
      this.decoderProcess = null;
    }
    if(this.framesDir){
      console.log('Cleaning up frames directory');
      rimraf.sync(this.framesDir);
      this.framesDir = null;
    }
    switch(code){
      case 'SIGINT':
        process.exit();
      default:
        process.exit();
    };
  }
}

module.exports = VideoReader;
