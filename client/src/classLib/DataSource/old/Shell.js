import _ from "lodash";
import crypto from 'crypto';

export default class Shell{
  constructor(shell, type){
    this.type = type;
    this.initial = shell;
    this.value = _.cloneDeep(shell);
    this.assembled = false;
    this.loaded = false;
    //this.value = this.template[type];
    //this.width = 0;
    //const shells = new Shells();
    //this.template = shells.template;
    //this.headerHeight = 40;
    //this.params = _.cloneDeep(this.shell.params);
    //this.initial = this.template[type].initial;

    _.forEach(this.value.initial, column=>{
      if (column.filters) _.forEach(column.filters, filter=>{filter.value=''});
    });
  }

  get getVersion(){
    const checked = JSON.stringify({
      shells: JSON.stringify(this.initial, function(key, value) {
        if (typeof value === 'function') {
          return value.toString();
        } else {
          return value;
        }
      })
    });
    const version = crypto.createHash('md5')
      .update(checked)
      .digest('hex');
    return version;
  }
}

