// requires
const _ = require('lodash');

// module variables
const config = require('./config.json');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];

//additional config from .env
require('dotenv').config();
const additionalConfig = {
    dadata : {
        token: process.env.DADATA_TOKEN,
        url: 'https://dadata.ru/api/v2/suggest/'
    },
    development : _.merge(config.development, {
        dialect: process.env.DB_CONNECTION,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        dialectOptions: {
            useUTC: false,
            timezone: 'Etc/GMT+0'
        },
        timezone: 'Etc/GMT+0'
    })
};
const finalConfig = _.merge(defaultConfig, environmentConfig, additionalConfig);

// as a best practice
// all global variables should be referenced via global. syntax
// and their names should always begin with g
global.gConfig = finalConfig;

// log global.gConfig
//console.log(`global.gConfig: ${JSON.stringify(global.gConfig, undefined, global.gConfig.json_indentation)}`);

module.exports = finalConfig;