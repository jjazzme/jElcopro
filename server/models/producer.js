module.exports = (sequelize, DataTypes) => {
    var producer = sequelize.define('Producer', {
        name: { type: DataTypes.STRING, unique: true },
        site: DataTypes.STRING,
        right_producer_id: { type:DataTypes.INTEGER },
        picture: DataTypes.STRING
    }, {
        freezeTableName: true,
        tableName: 'producers'
    });
    producer.associate = function(models) {
        producer.belongsTo(models.Producer, {
            foreignKey: 'right_producer_id',
            sourceKey: 'id',
            constraints: false,
            as: 'rightProducer'
        });
    };
    return producer;
};