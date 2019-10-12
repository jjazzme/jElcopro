'use strict';
module.exports = (sequelize, DataTypes) => {
  const Parameter = sequelize.define('Parameter', {
    key: {
      type: DataTypes.STRING,
      unique: 'cu_key'
    },
    value: DataTypes.STRING
  }, {
    uniqueKeys: {
      cu_key: {
        fields: ['key']
      }
    }
  });
  Parameter.associate = function(models) {
    // associations can be defined here
  };
  return Parameter;
};