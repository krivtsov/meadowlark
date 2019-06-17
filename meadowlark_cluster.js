const cluster = require('cluster');
const os = require('os');
const appMeadowlark = require('./meadowlark.js');

const startWorker = () => {
  const worker = cluster.fork();
  console.log('Claster %d starting', worker.id);
};

if (cluster.isMaster) {
  os.cpus().forEach(() => {
    startWorker();
  });
  cluster.on('disconnect', (worker) => {
    console.log('Claster %d disconnect', worker.id);
  });
} else {
  appMeadowlark();
}
