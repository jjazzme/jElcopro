const models = require('../../models');
const Auth = require('../../services/Auth');
const enums = require('../../modules/enums');
const express = require('express');
const router = express.Router();

// get shell by modelName
router.get('/:model/:userID', (req, res) => {
    const userID = parseInt(req.params.userID);
    const model = req.params.model;

    if (Auth.controllerPermissionIsDenied({
        clientUserID: userID,
        model: model,
        requiredPermissons: [enums.authType.Read]})
    ) {
        res.status(401).send('Authentication error');
        return;
    }


    models.tableShells.findOne({
        where:{
            user_id: userID,
            table: model
        }
    })
        .then(shell=>{
            res.send(Auth.permissionsShellFilter(model, shell));
        })
        .catch(err=>res.status(500).send(err));
});

// set shell by modelName
router.put('/:model/:userID', (req, res) => {
    // set shell
    const userID = parseInt(req.params.userID);
    const model = req.params.model;
    const id = req.body.shell.id;

    const shell = Auth.permissionsShellFilter(model, req.body.shell)

    if (Auth.controllerPermissionIsDenied({
        clientUserID: userID,
        model: model,
        requiredPermissons: [enums.authType.Read]})
    ) {
        res.status(401).send('Authentication error');
        return;
    }

    if(id===0) {
        models.tableShells.create(
            {
                user_id: userID,
                table: model,
                version: shell.version,
                basket: shell.basket,
                columns: shell.columns,
                optics: shell.optics
            })
            .then(shell=>{
                res.send(shell);
            })
            .catch(err=>res.status(500).send(err))
    } else {
        models.tableShells.upsert(
            {
                id: id,
                user_id: userID,
                table: model,
                version: shell.version,
                basket: shell.basket,
                columns: shell.columns,
                optics: shell.optics
            })
            .then(ok=>{
                res.send(ok);
            })
            .catch(err=>res.status(500).send(err))
    }


});

module.exports = router;