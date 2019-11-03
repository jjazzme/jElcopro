var express = require('express');
var router = express.Router();

const modelController = require('../controllers/model');
const servicesController = require('../controllers/services')
const shellController = require('../controllers/shell');
const middlewareController = require('../controllers/middle/main');
const authController = require('../controllers/auth');

/* Router middleware */
router.use(middlewareController.routeLog);

/* GET home page. */
router.get('/api/', function(req, res, next) {res.send('elcopro backend')});

/* Shell router */
router.get('/api/shell/:model/:userID', shellController.getByModel);
router.put('/api/shell/:model/:userID', shellController.setShell);

/* Model router */
router.put('/api/model/get/:model/:userID/:page', modelController.getModelByOptics);
router.put('/api/model/options/:model/:userID', modelController.getSelectors);
router.post('/api/model/update/:model/:userID', modelController.updateColumn);
router.put('/api/model-data/get/:model/:userID', modelController.getModelData);

/* Service router */
router.put('/api/service/get/:service/:userID/:name/:store', servicesController.getService);

/* Auth router */
router.post('/api/login', authController.login);
router.get('/api/logout', authController.logout);
router.get('/api/user', middlewareController.auth, (req, res) => {
    /*
    https://blog.jscrambler.com/vue-js-authentication-system-with-node-js-backend/

    let user = users.find(user => {
        return user.id === req.session.passport.user
    })

    console.log([user, req.session])

    res.send({ user: user })
     */
});

module.exports = router;

