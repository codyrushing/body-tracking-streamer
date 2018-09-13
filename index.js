const { spawn } = require('child_process');
const path = require('path');
const { watch } = require('fs');
const fs = require('mz/fs')
const { OPENPOSE_PATH, OPENPOSE_BIN_PATH, DATA_DIR, NET_RESOLUTION } = require('./config');

const dataDirectoryPath = path.join(__dirname, DATA_DIR);

const OP = spawn(
  OPENPOSE_BIN_PATH,
  [
    '--disable_multi_thread',
    '--net_resolution', NET_RESOLUTION,
    '--output_resolution', '320x-1',
    '--keypoint_scale', 3,
    '--render_threshold', 0.05,
    // '--render_pose', 0
    // '--camera', 1,
    '--write_json', dataDirectoryPath,
    // '--display', 0
  ],
  {
    cwd: OPENPOSE_PATH
  }
);

OP.stdout.on('data', data => console.log(data.toString()));
OP.stderr.on('data', data => console.error(data.toString()));
OP.on('error', console.error);

watch(
  dataDirectoryPath,
  (type, file) => {
    streamer.write(path.join( dataDirectoryPath, file.value));
  }
);
