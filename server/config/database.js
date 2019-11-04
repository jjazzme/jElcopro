require('dotenv').config();

module.exports = {
    development: {
        dialect: process.env.DB_CONNECTION,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
    },
    test: {
        dialect: process.env.DB_CONNECTION,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        dialect: 'mysql',
    },
};
