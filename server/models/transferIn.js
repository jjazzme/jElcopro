module.exports = (sequelize, DataTypes) => {
    const transferIn = sequelize.define('TransferIn', {
        date: { type: DataTypes.DATE, defaultValue: new Date() },
        number: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        document_type_id: { type: DataTypes.STRING, defaultValue: 'transfer-in' },
        parent_id: DataTypes.INTEGER,
        sellerable_id: DataTypes.INTEGER,
        sellerable_type: {
            type: DataTypes.STRING,
            defaultValue: 'Company',
            allowNull: false,
        },
        buyerable_id: DataTypes.INTEGER,
        buyerable_type: {
            type: DataTypes.STRING,
            defaultValue: 'Company',
            allowNull: false,
        },
        store_id: DataTypes.INTEGER,
        foreign_store_id: DataTypes.INTEGER,
        closed: { type: DataTypes.BOOLEAN, defaultValue: false },
        currency_id: { type: DataTypes.STRING, defaultValue: 'R01000' },
        number_prefix: DataTypes.STRING,
        status_id: { type: DataTypes.STRING, defaultValue: 'formed' },
    }, {
        freezeTableName: true,
        tableName: 'documents',
        defaultScope: { where: { document_type_id: 'transfer-in' } },
    });
    transferIn.prototype.getParentAlias = function () {
        return `${this.Parent.DocumentType.name} №${this.Parent.number}`;
    };
    transferIn.associate = function (models) {
        transferIn.belongsTo(models.DocumentType, { foreignKey: 'document_type_id', as: 'documentType' });
        transferIn.belongsTo(models.Order, { foreignKey: 'parent_id', as: 'parent' });
        transferIn.belongsTo(models.Store, { foreignKey: 'foreign_store_id', as: 'foreignStore' });
        transferIn.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        transferIn.belongsTo(models.Store, { foreignKey: 'store_id', as: 'store' });
        transferIn.belongsTo(models.Currency, { foreignKey: 'currency_id', as: 'currency' });
        transferIn.belongsTo(models.Company, {
            foreignKey: 'sellerable_id',
            constraints: false,
            as: 'sellerable',
        });
        transferIn.belongsTo(models.Company, {
            foreignKey: 'buyerable_id',
            constraints: false,
            as: 'buyerable',
        });
        transferIn.hasMany(models.DocumentLine, { foreignKey: 'document_id', as: 'documentLines' });
        transferIn.hasMany(models.Document, { foreignKey: 'parent_id', as: 'children' });
    };
    return transferIn;
};
