'use strict';

module.exports = (sequelize, DataTypes) => {
    var Price = sequelize.define('Price', {
        good_id: DataTypes.INTEGER,
        currency_id: DataTypes.STRING,
        min: DataTypes.INTEGER,
        max: DataTypes.INTEGER,
        our_price: DataTypes.DECIMAL(18, 6),
        for_all_price: DataTypes.DECIMAL(18, 6)
    }, {
        freezeTableName: true,
        tableName: 'prices'
    });
    Price.associate = function(models) {
        Price.belongsTo(models.Good, { foreignKey:'good_id' });
        Price.belongsTo(models.Currency, { foreignKey: 'currency_id' });
    };
    return Price;
};