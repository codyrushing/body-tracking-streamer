const os = require('os');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { Readable } = require('stream');
const rimraf = require('rimraf');

const mkdtemp = promisify(fs.mkdtemp);

class VideoReader extends Readable {
  constructor(params){
    const { streamOptions={} } = params;
    super({
      objectMode: true,
      highWaterMark: 1,
      ...streamOptions
    });
    this.params = params;
    this.destroy = this.destroy.bind(this);
    this.init();
  }
  init(){
    // do stuff here
  }
  async decode(){
    const { src, filters={} } = this.params;
    if(!src) {
      console.error('Could not start decode process, no src specified');
      return;
    }

    this.stop();
    if(this.frameStream){
      this.frameStream.destroy();
    }

    this.framesDir = await mkdtemp(
      path.join(os.tmpdir(), `${path.basename(src, path.extname(src))}-`)
    );

    this.decoder = execFile(
      'ffmpeg',
      [
        '-re',
        '-i', src,
        '-vf',
        // TODO this no longer needs to be a square
        'scale=801x801',
        // '-re',
        // 'eq=' + Object.entries(this.videoFilters).map(([key,val])=> `${key}=${val}`).join(':'),
        path.join(this.framesDir, 'frame-%06d.png')
      ]
    );

    this.decoder.on('error', console.error);

    fs.watch(
      this.framesDir,
      (type, file) => {
        if(type === 'rename'){
          // TODO delete any files that are just getting dropped off the buffer
          this.unshift(path.join(this.framesDir, file));
        }
      }
    );
  }

  _read(data){
    //
  }

  stop(){
    if(this.decoder){
      this.decoder.kill(1);
      this.decoder = null;
    }
  }

  // this method should be synchronous
  destroy(){
    super.destroy();
    this.stop();
    if(this.framesDir){
      rimraf.sync(this.framesDir);
      this.framesDir = null;
    }
  }
}

module.exports = VideoReader;
