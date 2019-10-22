'use strict'

module.exports = (sequelize, DataTypes) => {
    const currency = sequelize.define('Currency', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        num_code: DataTypes.STRING,
        char_code: DataTypes.STRING,
        nominal: DataTypes.INTEGER,
        name: DataTypes.STRING,
    }, {
        freezeTableName: true,
        tableName: 'currencies',
    });
    currency.associate= function (models) {

    };
    return currency
};