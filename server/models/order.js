
module.exports = (sequelize, DataTypes) => {
    const order = sequelize.define('Order', {
        buyerable_id: DataTypes.INTEGER,
        buyerable_type: {
            type: DataTypes.STRING,
            defaultValue: 'Company',
            allowNull: false,
        },
        closed: { type: DataTypes.BOOLEAN, defaultValue: false },
        currency_id: { type: DataTypes.STRING, defaultValue: 'R01000' },
        date: { type: DataTypes.DATE, defaultValue: new Date() },
        document_type_id: { type: DataTypes.STRING, defaultValue: 'invoice' },
        foreign_store_id: DataTypes.INTEGER,
        number: DataTypes.INTEGER,
        number_prefix: DataTypes.STRING,
        parent_id: DataTypes.INTEGER,
        sellerable_id: DataTypes.INTEGER,
        sellerable_type: {
            type: DataTypes.STRING,
            defaultValue: 'Company',
            allowNull: false,
        },
        status_id: { type: DataTypes.STRING, defaultValue: 'formed' },
        store_id: DataTypes.INTEGER,
        sum: {
            type: DataTypes.VIRTUAL,
            get: function () {
                return '0.00'
            }
        },
        user_id: DataTypes.INTEGER,
    }, {
        freezeTableName: true,
        tableName: 'documents',
        defaultScope: { where: { document_type_id: 'order' } },
    });
    order.prototype.getParentAlias = function () {
        return `${this.Parent.DocumentType.name} №${this.Parent.number}`;
    };
    order.associate = function (models) {
        order.belongsTo(models.DocumentType, { foreignKey: 'document_type_id', as: 'documentType' });
        order.belongsTo(models.Document, { foreignKey: 'parent_id', as: 'parent' });
        order.belongsTo(models.Store, { foreignKey: 'foreign_store_id', as: 'foreignStore' });
        order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        order.belongsTo(models.Store, { foreignKey: 'store_id', as: 'store' });
        order.belongsTo(models.Currency, { foreignKey: 'currency_id', as: 'currency' });
        order.belongsTo(models.Company, {
            foreignKey: 'sellerable_id',
            constraints: false,
            as: 'sellerable',
        });
        order.belongsTo(models.Company, {
            foreignKey: 'buyerable_id',
            constraints: false,
            as: 'buyerable',
        });
        order.hasMany(models.DocumentLine, { foreignKey: 'document_id', as: 'documentLines' });
        order.hasMany(models.TransferIn, { foreignKey: 'parent_id', as: 'children' });
    };
    return order;
};
