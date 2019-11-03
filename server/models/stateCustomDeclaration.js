module.exports = (sequelize, DataTypes) => sequelize.define('StateCustomDeclaration', {
    number: DataTypes.STRING,
    country_code: DataTypes.STRING,
    country_short_name: DataTypes.STRING,
}, {
    freezeTableName: true,
    tableName: 'state_custom_declarations',
});
