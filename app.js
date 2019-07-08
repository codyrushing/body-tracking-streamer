const { manageProcess } = require('./lib/util');

(async function(){
  // start the data pipeline
  const { videoReader } = await require('./data-pipeline')();

  manageProcess(
    process,
    {
      // cleanup video reader if needed
      cleanup: () => {
        if(videoReader){
          videoReader.destroy();
        };
      }
    }
  );
})();
