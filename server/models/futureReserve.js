module.exports = (sequelize, DataTypes) => {
    const futureReserve = sequelize.define('FutureReserve', {
        document_line_id: DataTypes.INTEGER,
        ballance: DataTypes.INTEGER,
    }, {
        freezeTableName: true,
        tableName: 'future_reserves',
    });
    futureReserve.associate = function (models) {
        futureReserve.belongsTo(models.DocumentLine, { foreignKey: 'document_line_id', as: 'documentLine' });
    };
    return futureReserve;
};
