'use strict';

import Swal from "sweetalert2";
import store from '../store/_index'

export default class Error {
  constructor({ error, logging, write }){
    this.error = error;
    this.logging = logging;
    this.write = write;
  }

  process(type){
    if (this.write) console.log(type, this.error);
    if (this.logging) {
      // db logging ?
    }
    if (type === this.types.axios) {
      if (this.error.message === 'aborted') {
        console.log('axios aborted');
      } else if (this.error.response && this.error.response.status === 401) {
        store.dispatch('User/logoff');
      } else {
        Swal.fire({
          title: 'Ошибка axios',
          text:  this.error.response.data.message ? this.error.response.data.message : this.error.response.data,
          type:  'error',
          timer: 15000
        });
      }
      return Promise.reject(this.error)
    }

    else {
      Swal.fire({
        title: 'Ошибка',
        text:  this.error.response.data,
        type:  'error',
        timer: 15000
      });
    }
  }
  get types() { return { axios: 1 } }
}

//class ErrorTypes {
//  axios = 1;
//}