module.exports = (sequelize, DataTypes) => {
    const currencyRate = sequelize.define('CurrencyRate', {
        currency_id: { type: DataTypes.STRING, unique: 'currencyOnDate' },
        date: { type: DataTypes.DATEONLY, unique: 'currencyOnDate' },
        rate: DataTypes.DECIMAL(18, 6),
    }, {
        freezeTableName: true,
        tableName: 'currency_rates',
    });
    currencyRate.associate = function (models) {
        currencyRate.belongsTo(models.Currency, { foreignKey: 'currency_id', as: 'currency' });
    };
    return currencyRate;
};
