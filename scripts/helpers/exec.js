const shell = require('shelljs');

const logger = require('./logger');

const exec = async (cmd, opts = {}) => new Promise((resolve, reject) => {
  logger.debug(`Executing shell command '${cmd}'`);
  shell.exec(cmd, { silent: true, ...opts }, (code, stdout, stderr) => {
    if (code !== 0) {
      return reject(new Error(`${code}: ${stderr}`));
    }
    return resolve(stdout);
  });
});

module.exports = exec;
