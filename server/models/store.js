'use strict';

module.exports = (sequelize, DataTypes) => {
  const store = sequelize.define('Store', {
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER,
    online: DataTypes.BOOLEAN,
    is_main: DataTypes.BOOLEAN,
    icon: DataTypes.STRING(400)
  }, {
    freezeTableName: true,
    tableName: 'stores'
  });
  store.associate = function(models) {
    // associations can be defined here
    store.belongsTo(models.Company, {
      as: 'company', foreignKey: 'company_id'
    });
    store.hasMany(models.InterStoreRoute, {
      as: 'fromRoutes', foreignKey: 'from_store_id'
    });
  };
  return store;
};