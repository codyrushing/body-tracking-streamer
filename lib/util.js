const manageProcess = (process, { cleanup }) => {
  //do something when app is closing

  Object.entries({
    exit: cleanup,
    SIGINT: process.exit,
    SIGUSR1: process.exit,
    SIGUSR2: process.exit,
    uncaughtException: (err) => {
      console.error(err);
      process.exit();
    }
  })
  .forEach(
    function([ev, fn]){
      process.on(
        ev,
        function(){
          fn.apply(null, arguments);
        }
      );
    }
  );
}

const getBoundingBoxFromPose = pose => {
  
}

module.exports = {
  manageProcess
};
