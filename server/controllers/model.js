'use strict';

const Producer = require('../models').Producer;

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

        let filters = []
        _.forEach(optics.filters, (row, name)=>{
            _.forEach(row, item=>{
                if (!!item.value) filters.push({name: name, type: item.type, value: item.value})
            });
        });

        let include = [];
        _.forEach(params._include, inc=>{
            include.push({model: models[inc.model], as: inc.as})
        });

        let rootWhere = {};
        let wheres = {_root:[]};
        _.forEach(filters, filter=>{
            if (params[filter.name] && !wheres[filter.name]) wheres[filter.name] = [];

            let item = {};
            if (filter.type==='search') {
                item[params[filter.name] ? params[filter.name].column : filter.name] = {[Op.like]: `%${filter.value}%`}
            }

            wheres[params[filter.name] ? filter.name : '_root'].push(item)
        });
        _.forEach(wheres, (where, name)=>{
            if (name==='_root') {
                rootWhere = {[Op.and]: where}
            } else {
                const inc = _.filter(include, function(item){return item.as===_.last(params[name].as)});
                inc[0].where = {[Op.and]: where};
            }
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

        let order = [];
        let sorters = _.pickBy(optics.sorters, function(item){return item.order!==null});
        sorters = _.map(sorters, function(item,key){return {order: item.order, column: key, value: item.value}});
        sorters = _.orderBy(sorters, 'order', 'asc');
        _.forEach(sorters, item=>{
            let orderItem = [];
            let column = item.column;
            if (params[item.column]) {
                column = params[item.column].column;
                _.forEach(params[item.column].as, associated=>{
                    orderItem.push(associated)
                });
            }
            orderItem.push(column, item.value);
            if (orderItem.length!==0) order.push(orderItem);
        });

        models[model].findAndCountAll({
            include: include,
            order: order,
            limit: pageSize,
            offset: offset,
            where: rootWhere,
            //where: [{[Op.and]:[{name: {[Op.like]: '%антен%'}}]}]
            //where:{name:{[Op.like]: '%кита%'}}
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

