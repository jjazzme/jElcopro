'use strict';

const models = require('../models');
const _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


module.exports = {
    run: () => {
        let params = {_include: [['Producer', 'test', 'third'], ['Category']]}

        let include = function(obj){
            let ret = []
            _.forEach(obj, row=>{
                let top = {};
                let current = top;
                _.forEach(row, (item, ind)=>{
                    current.model = item;
                    if (ind !== row.length-1){
                        current.include = [{}];
                        current = current.include[0];
                    }
                });
                ret.push(top)
            })
            return ret;
        };

        console.log(JSON.stringify(include(params._include)))

        /*
models.Product.findAll({
    include: [ {model: models.Producer}, {model: models.Picture, where:[{id:{[Op.not]:null}}]} ],
    limit: 100,
    offset: 0
}).then(res=>{console.log(res)})

models.test.updateIfNotExists(
    {
        f1: 99,
        f2: 'rrr'
    },
    {
        where: {id: 1},
    }
)
.then(ret => {
    console.log(ret);
});
 */
    }

};

