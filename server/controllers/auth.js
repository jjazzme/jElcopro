'use strict'

//const models = require('../models');
//const Auth = require('../services/Auth');
//const enums = require('../modules/enums');
const passport = require('passport');

module.exports = {
    login: (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.status(400).send([user, "Cannot log in", info]);
            }

            req.login(user, err => {
                res.send("Logged in");
            });
        })//(req, res, next);
    },

    logout: (req, res) => {
        req.logout();
        console.log('loggrd out');
        return res.send();
    },
};