require("@babel/core");
require("@babel/polyfill");
var config = require('../config/config.js');
var models = require("../models");

var sequelize = models.sequelize;
sequelize.sync({alter:true}).then(res => {
    console.log('Nice! Database looks fine')
}).catch(err => {
    console.log(err, "Something went wrong with the Database Update!")
});