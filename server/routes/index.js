import Document from "../controllers/Document";

var express = require('express');
var router = express.Router();

const modelController = require('../controllers/model');
const servicesController = require('../controllers/services')
const shellController = require('../controllers/shell');
const middlewareController = require('../controllers/middle/main');
const authController = require('../controllers/auth');

const documentController = new Document();

/* Router middleware */
router.use(middlewareController.routeLog);

/* GET home page. */
router.get('/api/', function(req, res, next) {res.send('elcopro backend')});

/* Shell router */
router.get('/api/shell/:type', shellController.getByModel);
router.put('/api/shell/:type', shellController.setShell);

/* Model router */
router.put('/api/model/get/:type', modelController.getModelByOptics);
router.put('/api/model/options/:model/:userID', modelController.getSelectors);
router.post('/api/model/update/:model/:userID', modelController.updateColumn);
router.put('/api/refdata/get/:name/:userID', modelController.getRefData);
router.get('/api/invoice/get/:id', modelController.getInvoiceWithLines);
router.get('/api/order/get/:id', modelController.getOrderWithLines);
router.get('/api/transferin/get/:id', modelController.getTransferInWithLines);
router.get('/api/transferout/get/:id', modelController.getTransferOutWithLines);
router.get('/api/product/get/:id', modelController.getProduct);
router.put('/api/document/line/add/:id/:userID', modelController.addLineToDocument);
router.get('/api/document/line/delete/:docId/:lineId', modelController.deleteLineFromDocument);

// Actions router
router.get('/api/document/dotransition/:type/:id/:transition/:own', documentController.doTransition);
router.post('/api/document/createtransfer', documentController.createTransfer);

/* Service router */
router.put('/api/service/get/:service/:userID', servicesController.getService);

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
router.get('/api/user/get/:userID/:fromID', authController.getUser);
router.get('/api/user/get/self', authController.getSelf);
router.put('/api/user/cards/set/:userID', authController.setCards);

module.exports = router;

