'use strict';

export default class Utils {
    get DateTime(){
        return new Date();
    }
}


String.prototype.capitalize =  function(){
    return this.replace(/^[а-я a-z]/, c => c.toUpperCase());
};

//Object.prototype.meaning = function () {
//    return !_.isEmpty(this)
//};

//const meaning = Symbol();
//Object.prototype[meaning] =  function(){return !_.isEmpty(this)};
//export {meaning};

