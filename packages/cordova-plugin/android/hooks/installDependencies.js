var child_process = require('child_process');

module.exports = function (context) {
  return new Promise(function (resolve, reject) {
    child_process.exec('npm install', {cwd: __dirname}, function (error) {
      if (error !== null) {
        console.log('exec error: ' + error);
        reject('npm installation failed');
      }
      else {
        resolve();
      }
    });
  });
};
