module.exports = (sequelize, DataTypes) => {
    const departure = sequelize.define('Departure', {
        document_line_id: DataTypes.INTEGER,
        arrival_id: DataTypes.INTEGER,
    }, {
        freezeTableName: true,
        tableName: 'departures',
    });
    departure.associate = function (models) {
        departure.belongsTo(models.DocumentLine, { foreignKey: 'document_line_id', as: 'documentLine' });
        departure.belongsTo(models.Arrival, { foreignKey: 'arrival_id', as: 'arrival' });
    };
    return departure;
};
