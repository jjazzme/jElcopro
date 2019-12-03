module.exports = (sequelize, DataTypes) => {
    const arrival = sequelize.define('Arrival', {
        document_line_id: DataTypes.INTEGER,
        ballance: DataTypes.INTEGER,
    }, {
        freezeTableName: true,
        tableName: 'arrivals',
    });
    arrival.associate = function (models) {
        arrival.belongsTo(models.DocumentLine, { foreignKey: 'document_line_id', as: 'documentLine' });
        arrival.hasMany(models.ReserveModel, { foreignKey: 'arrival_id', as: 'reserves' });
        arrival.hasMany(models.Departure, { foreignKey: 'arrival_id', as: 'departures' });
    };
    return arrival;
};
