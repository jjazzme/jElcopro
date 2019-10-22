'use strict';

module.exports = (sequelize, DataTypes) => {
    var parameterName = sequelize.define('ParameterName', {
        name: DataTypes.STRING,
        alias: DataTypes.STRING,
        type: DataTypes.INTEGER, //0 - text, 1 - number
        base_unit_id: DataTypes.INTEGER,
    }, {
        freezeTableName: true,
        tableName: 'parameter_names'
    });
    parameterName.associate = function(models) {
        parameterName.belongsTo(models.Unit, {
            foreignKey: 'base_unit_id',
            sourceKey: 'id',
            constraints: false,
            as: 'baseUnit'
        });
    };
    return parameterName;
};