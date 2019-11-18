'use strict';

import Services from "../services";
import Invoice from '../services/InvoiceService';

const models = require('../models');
const Auth = require('../services/Auth');
const enums = require('../modules/enums');
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

        _.forEach(params.filters, (filterSet, field)=>{
            _.forEach(filterSet, filter=>{
                if (!optics.filters) optics.filters = {};
                if (!optics.filters[field]) optics.filters[field] = [];
                optics.filters[field].push(filter);
            });
        });

        let actualFilters = {};
        _.forEach(optics.filters, (row, name)=>{
            _.forEach(row, item=>{
                if (!!item.value) {
                    if (!actualFilters[name]) actualFilters[name] = [];
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
                    current.as = val.as
                      ? val.as.split('.')[ind]
                        ? val.as.split('.')[ind]
                        : _.camelCase(item)
                      : _.camelCase(item);
                    if (ind!==val.path.split('.').length-1){
                        current.include = [{}];
                        current = current.include[0];
                    } else {
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
                                    if (filter.type === '=') {
                                        let whereItem = {};
                                        whereItem[val.column] = {[Op.eq]: filter.value};
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
                if (filter.type === '=') {
                    let whereItem = {};
                    whereItem[name] = {[Op.eq]: filter.value};
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
                res.json({error: err.message});
            });


    },

    // get selectors
    getSelectors(req, res){
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

        const fields = req.body.fields;

        models[model].findAll({
            attributes: fields
        })
            .then(resp=>{
                res.send(resp);
            })
            .catch(err=>{
                res.status(500);
                res.json({error: err});
            });

    },

    // апдейт ячейки
    updateColumn(req, res){
        const userID = parseInt(req.params.userID);
        const model = req.params.model;

        const packet = req.body.packet;
        const id = packet.id;
        const column = packet.column;
        const value = packet.value;

        if (Auth.controllerPermissionIsDenied({
            clientUserID: userID,
            model: model,
            id: id,
            column: column,
            requiredPermissons: [enums.authType.Update]})
        ) {
            res.status(401).send('Authentication error');
            return;
        }

        models[model].findByPk(id)
            .then(oldItem=>{
                oldItem.set(column, value).save({fields: [column]})
                    .then(newItem=>{
                        res.send({old: oldItem[column], new: newItem[column]});
                    })
                    .catch(err=>{
                        res.status(500);
                        res.json({error: err});
                    });
                });
    },

    //
    getRefData(req, res){
        const userID = parseInt(req.params.userID);
        const name = req.params.name;
        const services = new Services();

        if (Auth.controllerPermissionIsDenied({
            clientUserID: userID,
            model: name,
            requiredPermissons: [enums.authType.Read]})
        ) {
            res.status(401).send('Authentication error');
            return;
        }

        if(models[name]) {
            const includes = req.body.includes;
            const sorters = req.body.sorters;

            let include = []
            _.forEach(includes, item=>{
                let top = {};
                let current = top;
                const path = item.path.split('.')
                _.forEach(path, (model, ind)=>{
                    current.model = models[model];
                    current.as = _.camelCase(model)
                    if(path.length-1 !== ind){
                        current = current.include = {};
                    }
                });
                include.push(top)
            });

            models[name].findAll({
                include: include,
                order: sorters,
                limit: 1000
            })
              .then(resp=>{
                  res.send(Auth.permissionsModelFilter(name, resp));
              })
              .catch(err=>{
                  res.status(500);
                  res.json({error: err});
              });
        } else if (services.all[name])  {
            const Service = services.all[name];
            const service = new Service();
            service.default
              .then(resp=>{
                  res.send(resp);
              })
              .catch(err=>{
                res.status(500);
                res.json({error: err});
              });
        }

    },

    getInvoiceWithLine(req, res){
        const invoice = new Invoice();
        invoice.getModel(parseInt(req.params.id))
          .then(ans=>{
              res.send(ans);
          })
          .catch(err=>{
              res.status(500).json({error: err.message})
          });
    }
};

//router.put('/get/:model/:userID/:page', (req, res) => {});
//module.exports = router;

