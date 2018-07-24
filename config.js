const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = yaml.safeLoad(
  fs.readFileSync(
    process.env.CONFIG || path.join(__dirname, 'config.yml')
  )
);
