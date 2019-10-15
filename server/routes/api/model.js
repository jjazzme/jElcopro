var models = require('../../models');
const Auth = require('../../services/Auth');
const enums = require('../../modules/enums');
var express = require('express');
var router = express.Router();

// get model by optics
router.put('/get/:model/:userID/:page', (req, res) => {


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

    const optics = req.body.optics;
    const params = req.body.params;

    const page = req.params.page;
    const pageSize = optics.pageSize ? optics.pageSize : 15;
    const offset = (page-1) * pageSize;
    const limit = offset + pageSize;
    let include = params._include ? params._include : [];
    let order = [];
    let sorters = _.
    _.forEach(optics.sorters, item=>{

    });

    models[model].findAndCountAll({
        limit: pageSize,
        offset: offset,
        include: include,
        order: order,
    })
        .then(resp=>{
            const pages = Math.ceil(parseFloat(resp.count) / pageSize);
            res.send({
                rows: Auth.permissionsModelFilter(model, resp.rows),
                count: resp.count,
                offset: offset,
                page: page,
                limit: limit,
                pageSize: pageSize,
                pages: pages,
                permissions: Auth.getModelPermissions(model, resp.rows)
            });
        })
        .catch(err=>{
            err=>res.status(500).send(err);
        });


});

module.exports = router;

