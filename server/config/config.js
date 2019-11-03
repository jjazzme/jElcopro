// requires
const _ = require('lodash');
const companies = require('./companies').default;

// module variables
const config = require('./config.json');

const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];

// additional config from .env
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const additionalConfig = {
    dadata: {
        token: process.env.DADATA_TOKEN,
        url: 'https://dadata.ru/api/v2/suggest/',
    },
    sequelize: {
        dialect: process.env.DB_CONNECTION,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
    },
    companies,
};
if (!global.sequelize_logging) {
    additionalConfig.sequelize.logging = false;
}
if (additionalConfig.sequelize.dialect !== 'mysql') {
    additionalConfig.sequelize.dialectOptions = { useUTC: false, timezone: 'Etc/GMT+0' };
    additionalConfig.sequelize.timezone = 'Etc/GMT+0';
}
const finalConfig = _.merge(defaultConfig, environmentConfig, additionalConfig);

// as a best practice
// all global variables should be referenced via global. syntax
// and their names should always begin with g
global.gConfig = finalConfig;

// log global.gConfig
// console.log(`global.gConfig: ${JSON.stringify(global.gConfig, undefined, global.gConfig.json_indentation)}`);

module.exports = finalConfig;
