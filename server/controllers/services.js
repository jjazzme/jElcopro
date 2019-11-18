'use strict';

const Auth = require('../services/Auth');
const enums = require('../modules/enums');
import PriceService from "../services/PriceService";


module.exports = {

    // get model by optics
    getService(req, res){
        const userID = parseInt(req.params.userID);
        const serviceName = req.params.service;

        if (Auth.controllerPermissionIsDenied({
            clientUserID: userID,
            requiredPermissons: [enums.authType.Read]})
        ) {
            res.status(401).send('Authentication error');
            return;
        }

        const optics = req.body.optics;
        let promise = null;
        let service = null;
        if (serviceName==='PriceService'){
            service = new PriceService();

            if (optics.from_store) promise = service.searchByNameOnStore(optics);
            else if (optics.from_store_ids) promise = service.searchByName(optics);

        }

        if (promise) promise
            .then(r=>
              res.send(r)
            )
            .catch(e=>{
                res.status(500);
                res.json({error: e}
                )});
        else {res.status(500); res.json({error: 'no promise'})}
    },

};

//router.put('/get/:model/:userID/:page', (req, res) => {});
//module.exports = router;

