import companies from './companies';

require('dotenv').config();

const config = {
    db: {
        dialect: process.env.DB_CONNECTION,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
    },
    dadata: {
        url: process.env.DADATA_URL || 'https://dadata.ru/api/v2/suggest/',
        token: process.env.DADATA_TOKEN,
    },
    companies,
};

const additionalConfig = { };
if (process.env.DB_CONNECTION === 'mariadb') {
    additionalConfig.dialectOptions = { useUTC: false, timezone: 'Etc/GMT+0' };
    additionalConfig.timezone = 'Etc/GMT+0';
} else {
    additionalConfig.dialectOptions = { decimalNumbers: true };
}

Object.assign(config.db, additionalConfig);

export default config;
