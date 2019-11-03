'use strict';

const Auth = require('../services/Auth');
const enums = require('../modules/enums');
import PriceService from "../services/PriceService";

module.exports = {

    // get model by optics
    getService(req, res){
        const userID = parseInt(req.params.userID);
        const serviceName = new Services[req.params.service]();

        if (Auth.controllerPermissionIsDenied({
            clientUserID: userID,
            requiredPermissons: [enums.authType.Read]})
        ) {
            res.status(401).send('Authentication error');
            return;
        }

        let promise = null;
        let service = null
        if (serviceName==='PriceServise'){
            service = new PriceService();

            const name = req.params.name;
            const store = parseInt(req.params.store);

            if (store) promise = service.searchByNameOnStore(name, store);
            else promise = service.searchByName({name: name});

        }

        promise
            .then(r=>res.send(r))
            .catch(e=>{res.status(500); res.json({error: e})});

    },

};

//router.put('/get/:model/:userID/:page', (req, res) => {});
//module.exports = router;

