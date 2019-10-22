'use strict';

module.exports = (sequelize, DataTypes) => {
    var Good = sequelize.define('Good', {
        store_id: { type: DataTypes.INTEGER, unique: 'goods_store_id_product_id_code_unique' },
        product_id: { type: DataTypes.INTEGER, unique: 'goods_store_id_product_id_code_unique' },
        ballance: { type: DataTypes.INTEGER, defaultValue: 0 },
        code: { type: DataTypes.STRING, unique: 'goods_store_id_product_id_code_unique' },
        pack: { type: DataTypes.INTEGER, defaultValue: 1 },
        multiply: { type: DataTypes.INTEGER, defaultValue: 1 },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true }

    }, {
        freezeTableName: true,
        tableName: 'goods'
    });
    Good.associate = function(models) {
        Good.belongsTo(models.Store, { foreignKey:'store_id' });
        Good.belongsTo(models.Product, { foreignKey: 'product_id' });
    };
    return Good;
};