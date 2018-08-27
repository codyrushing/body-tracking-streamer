const path = require('path');
const fs = require('mz/fs');
const streamer = require('./streamer');
const wait = ms => new Promise( resolve => setTimeout(resolve, ms) );

const targetFPS = 15;
const delay = Math.round(1000 / targetFPS);

const demoDataPath = path.join( __dirname, 'demo-data');

require('./websocket-server');

const go = async function(){
  try {
    const files = await fs.readdir( demoDataPath );
    const fileIterator = files[Symbol.iterator]();

    var file = fileIterator.next();
    while(!file.done){
      streamer.write( path.join( demoDataPath, file.value) );
      await wait(delay);
      file = fileIterator.next();
    }
  }
  catch(err){
    console.error(err);
  }
}

go();
