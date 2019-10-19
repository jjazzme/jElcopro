'use strict';

const Producer = require('../models').Producer;

const models = require('../models');
const Auth = require('../services/Auth');
const enums = require('../modules/enums');
const _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//var babel = require("@babel/core").transform("code", {
//    plugins: ["@babel/plugin-proposal-optional-chaining"]
//});

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


        let actualFilters = {};
        _.forEach(optics.filters, (row, name)=>{
            _.forEach(row, item=>{
                if (!!item.value) {
                    if (!actualFilters[name]) actualFilters[name] = []
                    actualFilters[name].push({type: item.type, value: item.value})
                }
            });
        });

        let includeGen = function(obj){
            let ret = []
            _.forEach(obj, (val,name)=>{
                let top = {};
                let current = top;
                _.forEach(val.path.split('.'), (item, ind)=>{
                    current.model = models[item];
                    if (ind!==val.path.split('.').length-1){
                        current.include = [{}];
                        current = current.include[0];
                    } else {
                        if(val.as) current.as = val.as;
                        let actual = _.cloneDeep(actualFilters[name]);
                        if (actual){
                            if (actual.length>0) {
                                let arrWhere = [];
                                _.forEach(actual, filter=>{
                                    if (filter.type === 'search') {
                                        let whereItem = {};
                                        whereItem[val.column] = {[Op.like]: `%${filter.value}%`};
                                        arrWhere.push(whereItem)
                                    }
                                });
                                current.where = arrWhere.length > 1 ? [{[Op.and]: arrWhere}] : arrWhere[0] ;
                            }
                            delete actualFilters[name];
                        }
                    }
                });
                ret.push(top)
            });
            return ret;
        };
        let include = includeGen(params?.aliases);

        let arrWhereRoot = [];
        _.forEach(actualFilters, (actual, name)=>{
            _.forEach(actual, filter=>{
                if (filter.type === 'search') {
                    let whereItem = {};
                    whereItem[name] = {[Op.like]: `%${filter.value}%`};
                    arrWhereRoot.push(whereItem)
                }
            });
        });

        let where = arrWhereRoot.length===0 ? null : arrWhereRoot.length > 1 ? [{[Op.and]: arrWhereRoot}] : arrWhereRoot[0] ;

        let order = [];
        let sorters = _.pickBy(optics.sorters, function(item){return item.order!==null});
        sorters = _.map(sorters, function(item,key){return {order: item.order, column: key, value: item.value}});
        sorters = _.orderBy(sorters, 'order', 'asc');
        _.forEach(sorters, item=>{
            let orderItem = [];
            let column = item.column;
            const aliasesCol = params.aliases[item.column];
            if (aliasesCol) {
                column = aliasesCol.column;
                _.forEach(aliasesCol.path.split('.'), associated=>{
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
            where: where,

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
                res.status(500);
                res.json({error: err});
            });


    }
};

//router.put('/get/:model/:userID/:page', (req, res) => {});
//module.exports = router;

