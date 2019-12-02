import companies from './companies';

require('dotenv').config();

const config = {
    db: {
        dialect: process.env.DB_CONNECTION || 'mariadb',
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '123456',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '3306',
        database: process.env.DB_DATABASE || 'elcopro',
    },
    dadata: {
        url: process.env.DADATA_URL || 'https://dadata.ru/api/v2/suggest/',
        token: process.env.DADATA_TOKEN,
    },
    companies,
};

const additionalConfig = { };
if (!process.env.DB_CONNECTION || process.env.DB_CONNECTION === 'mariadb') {
    additionalConfig.dialectOptions = { useUTC: false, timezone: 'Etc/GMT+0' };
    additionalConfig.timezone = 'Etc/GMT+0';
} else {
    additionalConfig.dialectOptions = { decimalNumbers: true };
}

Object.assign(config.db, additionalConfig);

export default config;
