
module.exports = (sequelize, DataTypes) => {
    const address = sequelize.define('Address', {
        address: DataTypes.STRING,
        json: DataTypes.JSON,
    }, {
        freezeTableName: true,
        tableName: 'addresses',
    });
    // eslint-disable-next-line no-unused-vars
    address.associate = function (models) {
    // associations can be defined here
    };
    return address;
};
