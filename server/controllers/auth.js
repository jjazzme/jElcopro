'use strict'

const models = require('../models');
const Auth = require('../services/Auth');
const enums = require('../modules/enums');
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
    getUser(req, res){
        const userID = parseInt(req.params.userID);
        const fromID = parseInt(req.params.fromID);

        if (Auth.controllerPermissionIsDenied({
            clientUserID: userID,
            model: 'User',
            requiredPermissons: [enums.authType.Read]})
        ) {
            res.status(401).send('Authentication error');
            return;
        }

        Auth.getUser()
          .then(ans=>
            res.send(ans))
          .catch(err=>
            res.status(500).json({error: err.message}))
    },
    getSelf(req, res){
        Auth.getUser(1)
          .then(ans=>
            res.send(ans))
          .catch(err=>
            res.status(500).json({error: err.message}))
    },
    setCards(req, res){
        const userID = parseInt(req.params.userID);
        const cards = req.body.cards;
        models.User.findByPk(userID)
          .then(user=>{
              user.cards = cards;
              user.save()
                .then(user=>{
                    res.json({user: user})})
                .catch(err=>
                  res.status(500).json({error: err.message}))
          })
          .catch(err=>
            res.status(500).json({error: err.message}))
    },

};