'use strict';

module.exports = (sequelize, DataTypes) => {
    var parameterValue = sequelize.define('ParameterValue', {
        name: { type: DataTypes.STRING, unique: 'parameter_values_name_parameter_name_id_unique' },
        parameter_name_id: { type: DataTypes.INTEGER, unique: 'parameter_values_name_parameter_name_id_unique' },
        right_parameter_value_id: DataTypes.INTEGER,
    }, {
        freezeTableName: true,
        tableName: 'parameter_values'
    });
    parameterValue.associate = function(models) {
        parameterValue.belongsTo(models.ParameterName, {
            foreignKey: 'parameter_name_id',
            sourceKey: 'id',
            constraints: false,
            as: 'parameterName'
        });
        parameterValue.belongsTo(models.ParameterValue, {
            foreignKey: 'right_parameter_value_id',
            sourceKey: 'id',
            constraints: false,
            as: 'rightParameterValue'
        });
    };
    return parameterValue;
};