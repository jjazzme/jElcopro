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
      if (this.error.response.status === 401) {
        store.dispatch('Auth/logoff');
      } else {
        Swal.fire({
          title: 'Ошибка axios',
          text:  this.error.responce.data,
          type:  'error',
          timer: 15000
        });
      }
      return Promise.reject(this.error)
    }
  }
  get types() { return { axios: 1 } }
}

class ErrorTypes {
  axios = 1;
}