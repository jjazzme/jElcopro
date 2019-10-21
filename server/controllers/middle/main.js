'use strict'

module.exports = {
    routeLog(req, res, next){
        console.log(`Time: ${Date.now()}`);
        next();
    },
    auth: (req, res, next) => {
        if (!req.isAuthenticated()) {
            res.status(401).send('You are not authenticated')
        } else {
            return next()
        }
    }
};