const { Transform } = require('stream');
const globalEvents = require('./global-events');

class ConfigurableTransform extends Transform {
  constructor(params){
    const { streamOptions={} } = params;
    super(streamOptions);
    this.params = {};
    this.setParams(params);
    this.init();
  }
  setParams(params={}){
    this.params = {
      ...this.params,
      params
    };
  }
  init(){
    // listen for events to update config
    globalEvents.on(
      [this.params.eventNamespace, 'update']
        .filter(i => i)
        .join('.'),
      this.update.bind(this)
    );
  }
  update(params){
    this.setParams(params);
  }
}

module.exports = ConfigurableTransform;
