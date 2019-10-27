'use strict';

const capitalize = Symbol();

String.prototype[capitalize] =  function(){
    return this.replace(/^[а-я a-z]/, c => c.toUpperCase());
};

class Utils {

}

export {
    Utils,
    capitalize
}

