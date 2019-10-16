'use strict';

const models = require('../models');
const Auth = require('../services/Auth');
const enums = require('../modules/enums');
const _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

var babel = require("@babel/core").transform("code", {
    plugins: ["@babel/plugin-proposal-optional-chaining"]
});

module.exports = {
    // get model by optics
    getModelByOptics(req, res){
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

        let sorters = _.pickBy(optics.sorters, function(item){return item.order!==null});
        sorters = _.map(sorters, function(item,key){return {order: item.order, column: key, value: item.value}})
        //_.filter(optics.sorters, function(item){return item.order!==null});
        sorters = _.orderBy(sorters, 'order', 'asc');

        let where = [];
        let filters = []
        _.forEach(optics.filters, (row, name)=>{
            _.forEach(row, item=>{
                if (!!item.value) filters.push([name, item.type, item.value])
            });
        });

        //TODO - разобраться с ?.
        /*
    на сервер установил
    npm i --save-dev @babel/core
    npm i --save-dev @babel/plugin-proposal-optional-chaining
    в .babelrc
    {
      "plugins": ["@babel/plugin-proposal-optional-chaining"]
    }
    в явасккрипт
    var babel = require("@babel/core").transform("code", {
        plugins: ["@babel/plugin-proposal-optional-chaining"]
    });
    ( https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining )
    и всё равно при компиляции
        let t = params[key]?.obt;
         */
        //
        //let t = params?.test;
        //

        _.forEach(sorters, item=>{
            let orderItem = [];
            let column = item.column;
            if (params[item.column]) {
                column = params[item.column].column;
                _.forEach(params[item.column].object, associated=>{
                    orderItem.push(associated)
                });
            }
            orderItem.push(column, item.value);
            if (orderItem.length!==0) order.push(orderItem);
        });


        models[model].findAndCountAll({
            include: ['category', 'producer'],
            order: order,
            limit: pageSize,
            offset: offset,
            where: {
                [Op.and]:[
                    {name: {[Op.like]: '%антен%'}},
                ]
            }
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


    }
};

//router.put('/get/:model/:userID/:page', (req, res) => {});
//module.exports = router;

