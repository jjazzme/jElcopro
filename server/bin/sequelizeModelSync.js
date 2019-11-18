require('@babel/core');
require('@babel/polyfill');
// eslint-disable-next-line no-unused-vars
const config = require('../config/config.js');
const models = require('../models');

const { sequelize } = models;
// eslint-disable-next-line no-unused-vars
sequelize.sync({ alter: true }).then((res) => {
    console.log('Nice! Database looks fine');
}).catch((err) => {
    console.log(err, 'Something went wrong with the Database Update!');
});
