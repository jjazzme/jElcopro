'use strict';

module.exports = (sequelize, DataTypes) => {
  const address = sequelize.define('Address', {
    address: DataTypes.STRING,
    json: DataTypes.JSON
  }, {
    freezeTableName: true,
    tableName: 'addresses'
  });
  address.associate = function(models) {
    // associations can be defined here
  };
  return address;
};