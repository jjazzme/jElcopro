import fs from 'fs';

require("@babel/core");
require("@babel/polyfill");
var config = require('../config/config.js');
var models = require("../models");

const path = './commands/';

module.exports.run = async () => {
    var sequelize = models.sequelize;
    sequelize.sync({alter:true}).then(res => {
        console.log('Nice! Database looks fine')
    }).catch(err => {
        console.log(err, "Something went wrong with the Database Update!")
    });

    await fs.readdir(path, async (err, files) => {
        // eslint-disable-next-line global-require,import/no-dynamic-require
        const promises = files.filter((file) => file.indexOf('seed') === 0).map((file) => require(`./${file}`).run());
        await Promise.all(promises);
    });
    console.log('All seed');
};