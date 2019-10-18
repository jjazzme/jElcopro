'use strict';
module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define('Store', {
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER,
    online: DataTypes.BOOLEAN,
    is_main: DataTypes.BOOLEAN
  }, {});
  Store.associate = function(models) {
    // associations can be defined here
    Store.belongsTo(models.Company, {
      foreignKey: 'company_id'
    });
  };
  return Store;
};