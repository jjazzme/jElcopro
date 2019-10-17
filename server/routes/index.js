var express = require('express');
var router = express.Router();

const modelController = require('../controllers/model');
const shellController = require('../controllers/shell');
const middlewareController = require('../controllers/middle/main');

/* Router middleware */
router.use(middlewareController.routeLog);

/* GET home page. */
router.get('/api/', function(req, res, next) {res.send('elcopro backend')});

/* Shell router */
router.get('/api/shell/:model/:userID', shellController.getByModel);
router.put('/api/shell/:model/:userID', shellController.setShell);

/* Model router */
router.put('/api/model/get/:model/:userID/:page', modelController.getModelByOptics);

module.exports = router;

