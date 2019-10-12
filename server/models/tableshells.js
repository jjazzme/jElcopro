'use strict';
module.exports = (sequelize, DataTypes) => {
  const tableShells = sequelize.define('tableShells', {
    user_id: {
      type: DataTypes.INTEGER,
      unique: 'cu_user_table'
    },
    table: {
      type: DataTypes.STRING,
      unique: 'cu_user_table'
    },
    version: DataTypes.STRING,
    basket: DataTypes.JSON,
    columns: DataTypes.JSON,
    optics: DataTypes.JSON
  }, {
    uniqueKeys: {
      cu_user_table: {
        fields: ['user_id', 'table']
      }
    }
  });
  tableShells.associate = function(models) {
    // associations can be defined here
  };
  return tableShells;
};