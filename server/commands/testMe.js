'use strict';

const models = require('../models');
const _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


module.exports = {
    run: () => {
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
    }

};

