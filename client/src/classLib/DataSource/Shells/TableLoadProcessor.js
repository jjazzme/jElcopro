'use strict';

import $store from "../../../store/_index";

export default class TableLoadProcessor{
  constructor(type){
    this.type = type;
    this.previousOptics = null;
    this.eid = null;
    this.data = null;
  }

  getSource(optics) {
    const eid = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
    this.eid = eid;
    $store.dispatch('Binder/getByOptics', { type: this.type, payload: { optics, eid } })
      .then(ans => { this.data = ans })
      .finally(() => {
        this.eid = null;
      });
    this.previousOptics = optics;
  }

  displayedSelection(optics){
    return this.data ? this.data.rows : [];
  }
}