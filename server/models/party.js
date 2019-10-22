'use strict';

module.exports = (sequelize, DataTypes) => {
  const party = sequelize.define('Party', {
    inn: DataTypes.STRING,
    name: DataTypes.STRING,
    ogrn: DataTypes.STRING,
    json: DataTypes.JSON
  }, {
    freezeTableName: true,
    tableName: 'parties'
  });
  party.associate = function(models) {
    // associations can be defined here
  };
  return party;
};