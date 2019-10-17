'use strict'

const models = require('../models');
const Auth = require('../services/Auth');
const enums = require('../modules/enums');

module.exports = {
    // get shell by modelName
    getByModel(req, res){
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
    },

    // set shell by modelName
    setShell(req, res){
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
        };


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
                    res.send({id: shell.id});
                })
                .catch(err=>{
                    return res.status(500).send(err)
                })
        } else {
            models.tableShells.update({
                user_id: userID,
                table: model,
                version: shell.version,
                basket: shell.basket,
                columns: shell.columns,
                optics: shell.optics
                },
                {where: {id: id}}
                )
                .then(()=>{
                    res.send({id: id});
                })
                .catch(err=>res.status(500).send(err))
        }
    }
};

//router.get('/:model/:userID', (req, res) => {});
//router.put('/:model/:userID', (req, res) => {});
//module.exports = router;