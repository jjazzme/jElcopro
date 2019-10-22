'use strict';

module.exports = (sequelize, DataTypes) => {
    const price = sequelize.define('Price', {
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
    price.associate = function(models) {
        price.belongsTo(models.Good, { foreignKey:'good_id' });
        price.belongsTo(models.Currency, { foreignKey: 'currency_id' });
    };
    return price;
};