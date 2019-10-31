'use strict';

module.exports = (sequelize, DataTypes) => {
    var interStoreRoute = sequelize.define('InterStoreRoute', {
        from_store_id: { type: DataTypes.INTEGER },
        to_store_id: { type: DataTypes.INTEGER },
        name: DataTypes.STRING,
        minimum_days: { type: DataTypes.INTEGER, defaultValue: 0 },
        maximum_days: { type: DataTypes.INTEGER, defaultValue: 0 },
        average_days: { type: DataTypes.INTEGER, defaultValue: 0 },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        freezeTableName: true,
        tableName: 'inter_store_routes'
    });
    interStoreRoute.associate = function(models) {
        interStoreRoute.belongsTo(models.Store, { foreignKey:'from_store_id', as: 'fromStore' });
        interStoreRoute.belongsTo(models.Store, { foreignKey:'to_store_id', as: 'toStore' });
    };
    return interStoreRoute;
};