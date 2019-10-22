'use strict';

module.exports = (sequelize, DataTypes) => {
    var Unit = sequelize.define('Unit', {
        base_unit_id: { type: DataTypes.INTEGER, unique: 'units_base_unit_id_coeff_unique' },
        name: DataTypes.STRING,
        alias: DataTypes.STRING,
        divide: { type: DataTypes.Boolean, defaultValue: true },
        coeff: { type: DataTypes.INTEGER, defaultValue: 1, unique: 'units_base_unit_id_coeff_unique' },
    }, {
        freezeTableName: true,
        tableName: 'units'
    });
    Unit.associate = function(models) {
        Unit.belongsTo(models.Unit, {
            foreignKey: 'base_unit_id',
            sourceKey: 'id',
            constraints: false,
            as: 'baseUnit'
        });
    };
    return Unit;
};