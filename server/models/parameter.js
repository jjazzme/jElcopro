'use strict';

module.exports = (sequelize, DataTypes) => {
  const parameter = sequelize.define('Parameter', {
    key: {
      type: DataTypes.STRING,
      unique: 'cu_key'
    },
    value: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'parameters',
    uniqueKeys: {
      cu_key: {
        fields: ['key']
      }
    }
  });
  parameter.associate = function(models) {
    // associations can be defined here
  };
  return parameter;
};