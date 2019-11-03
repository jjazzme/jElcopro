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
        arrival.hasMany(models.Reserve, { foreignKey: 'arrival_id', as: 'reserves' });
    };
    return arrival;
};
