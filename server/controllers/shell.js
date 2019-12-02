'use strict'

const models = require('../models');
const Auth = require('../services/Auth');
const enums = require('../modules/enums');

module.exports = {
    // get shell by modelName
    getByModel(req, res){
        const userID = 1;
        const type = req.params.type;

        if (Auth.controllerPermissionIsDenied({
            clientUserID: userID,
            model: type,
            requiredPermissons: [enums.authType.Read]})
        ) {
            res.status(401).send('Authentication error');
            return;
        }


        models.Shells.findOne({
            where:{
                user_id: userID,
                table: type,
            }
        })
            .then(shell=>{
                res.send(Auth.permissionsShellFilter(type, shell));
            })
            .catch(err=>res.status(500).send(err));
    },

    // set shell by modelName
    setShell(req, res){
        const userID = 1;
        const type = req.params.type;
        const id = req.body.shell.id;

        const shell = Auth.permissionsShellFilter(type, req.body.shell);

        if (Auth.controllerPermissionIsDenied({
            clientUserID: userID,
            model: type,
            requiredPermissons: [enums.authType.Read]})
        ) {
            res.status(401).send('Authentication error');
            return;
        }


        if(id===0) {
            models.Shells.create(
                {
                    user_id: userID,
                    table: type,
                    version: shell.version,
                    basket: shell.basket,
                    columns: shell.columns,
                    optics: shell.optics
                })
                .then(shell => res.send({ data: shell }))
                .catch(err=>{
                    return res.status(500).send(err)
                })
        } else {
            models.Shells.findByPk(id)
              .then(inst=>{
                  if(inst.version !== shell.version) inst.version = shell.version;
                  if (!_.isEqual(inst.basket, shell.basket)) inst.basket = shell.basket;
                  if (!_.isEqual(inst.columns, shell.columns)) inst.columns = shell.columns;
                  if (!_.isEqual(inst.optics, shell.optics)) inst.optics = shell.optics;
                  inst.save()
                    .then(() => res.send( inst ))
                    .catch(err=>{
                        return res.status(500).send(err)
                    })
              });
            /*
            models.Shells.update({
                user_id: userID,
                table: type,
                version: shell.version,
                basket: shell.basket,
                columns: shell.columns,
                optics: shell.optics
                },
                {where: {id: id}}
                )
                .then(()=>{
                    res.send({ data: { id: id } });
                })
                .catch(err=>res.status(500).send(err))

             */
        }
    }
};

//router.get('/:model/:userID', (req, res) => {});
//router.put('/:model/:userID', (req, res) => {});
//module.exports = router;