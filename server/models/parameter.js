'use strict';

module.exports = (sequelize, DataTypes) => {
  var parameter = sequelize.define('Parameter', {
    product_id: { type: DataTypes.INTEGER, unique: 'parameters_product_id_parameter_name_id_unique' },
    parameter_name_id: { type: DataTypes.INTEGER, unique: 'parameters_product_id_parameter_name_id_unique' },
    parameter_value_id: DataTypes.INTEGER,
    unit_id: DataTypes.INTEGER,
    numeric_value: DataTypes.DECIMAL(24, 12)
  }, {
    freezeTableName: true,
    tableName: 'parameters'
  });
  parameter.associate = function(models) {
    parameter.belongsTo(models.ParameterName, {
      foreignKey: 'parameter_name_id',
      sourceKey: 'id',
      constraints: false,
      as: 'parameterName'
    });
    parameter.belongsTo(models.ParameterValue, {
      foreignKey: 'parameter_value_id',
      sourceKey: 'id',
      constraints: false,
      as: 'parameterValue'
    });
    parameter.belongsTo(models.Unit, {
      foreignKey: 'unit_id',
      sourceKey: 'id',
      constraints: false,
      as: 'unit'
    });
  };
  return parameter;
};