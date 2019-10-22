'use strict';

module.exports = (sequelize, DataTypes) => {
  const store = sequelize.define('Store', {
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER,
    online: DataTypes.BOOLEAN,
    is_main: DataTypes.BOOLEAN
  }, {
    freezeTableName: true,
    tableName: 'stores'
  });
  store.associate = function(models) {
    // associations can be defined here
    store.belongsTo(models.Company, {
      foreignKey: 'company_id'
    });
  };
  return store;
};