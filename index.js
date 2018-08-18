const { spawn } = require('child_process');
const path = require('path');
const { OPENPOSE_PATH, OPENPOSE_BIN_PATH, DATA_DIR, NET_RESOLUTION } = require('./config');

const OP = spawn(
  OPENPOSE_BIN_PATH,
  [
    '--disable_multi_thread',
    '--net_resolution', NET_RESOLUTION,
    '--camera', 1,
    '--write_json', path.join(__dirname, DATA_DIR),
    '--render_pose', 0,
    '--display', 0
  ],
  {
    cwd: OPENPOSE_PATH
  }
);

OP.stdout.on('data', data => console.log(data.toString()));
OP.stderr.on('data', data => console.error(data.toString()));
OP.on('error', console.error);
