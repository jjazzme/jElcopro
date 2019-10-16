'use strict'

module.exports = {
    routeLog(req, res, next){
        console.log(`Time: ${Date.now()}`);
        next();
    }
};