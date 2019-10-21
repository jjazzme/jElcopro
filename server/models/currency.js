'use strict'

module.exports = (sequelize, DataTypes) => {
    var Currency = sequelize.define('Currency', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        num_code: DataTypes.STRING,
        char_code: DataTypes.STRING,
        nominal: DataTypes.INTEGER,
        name: DataTypes.STRING,
    }, {});
    Currency.associate= function (models) {

    };
    return Currency
};