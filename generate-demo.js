const { spawn } = require('child_process');
const path = require('path');
const { OPENPOSE_PATH, OPENPOSE_BIN_PATH, DATA_DIR, NET_RESOLUTION } = require('./config');

const dataDirectoryPath = path.join(__dirname, 'demo-data');

console.log(dataDirectoryPath);

const OP = spawn(
  OPENPOSE_BIN_PATH,
  [
    '--disable_multi_thread',
    '--net_resolution', NET_RESOLUTION,
    '--output_resolution', '320x-1',
    '--keypoint_scale', 3,
    '--render_threshold', 0.25,
    '--render_pose', 0,
    '--video', '../../Downloads/VID_20180908_111728174.mp4',
    '--process_real_time',
    '--write_json', dataDirectoryPath,
    '--display', 0
  ],
  {
    cwd: OPENPOSE_PATH
  }
);

OP.stdout.on('data', data => console.log(data.toString()));
OP.stderr.on('data', data => console.error(data.toString()));
OP.on('error', console.error);
