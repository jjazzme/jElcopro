module.exports = (sequelize, DataTypes) => {
    const reserve = sequelize.define('Departure', {
        document_line_id: DataTypes.INTEGER,
        arrival_id: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,
        closed: DataTypes.BOOLEAN,
    }, {
        freezeTableName: true,
        tableName: 'reserves',
    });
    reserve.associate = function (models) {
        reserve.belongsTo(models.DocumentLine, { foreignKey: 'document_line_id', as: 'documentLine' });
        reserve.belongsTo(models.Arrival, { foreignKey: 'arrival_id', as: 'arrival' });
    };
    return reserve;
};
