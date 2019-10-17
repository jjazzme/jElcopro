'use strict';
module.exports = (sequelize, DataTypes) => {
  const Party = sequelize.define('Party', {
    inn: DataTypes.STRING,
    name: DataTypes.STRING,
    ogrn: DataTypes.STRING,
    json: DataTypes.JSON
  }, {});
  Party.associate = function(models) {
    // associations can be defined here
  };
  return Party;
};