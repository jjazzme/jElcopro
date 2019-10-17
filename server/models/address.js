'use strict';
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    address: DataTypes.STRING,
    json: DataTypes.JSON
  }, {});
  Address.associate = function(models) {
    // associations can be defined here
  };
  return Address;
};