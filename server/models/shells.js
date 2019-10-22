'use strict';

module.exports = (sequelize, DataTypes) => {
  const shells = sequelize.define('Shells', {
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
    freezeTableName: true,
    tableName: 'shells',
    uniqueKeys: {
      cu_user_table: {
        fields: ['user_id', 'table']
      }
    }
  });
  shells.associate = function(models) {
    // associations can be defined here
  };
  return shells;
};