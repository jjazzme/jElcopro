'use strict';

import Swal from "sweetalert2";
export default class Error {
  constructor(err){
    console.log(err);
    Swal.fire({
      title: 'Ошибка',
      text:  err.response.data.message,
      type:  'error',
      timer: 20000
    });
  }
}