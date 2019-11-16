module.exports = (sequelize, DataTypes) => {
    const invoice = sequelize.define('Invoice', {
        date: { type: DataTypes.DATE, defaultValue: new Date() },
        number: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        document_type_id: { type: DataTypes.STRING, defaultValue: 'invoice' },
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
        defaultScope: { where: { document_type_id: 'invoice' } },
    });
    invoice.prototype.getParentAlias = function () {
        return `${this.parent.documentType.name} №${this.parent.number}`;
    };
    invoice.associate = function (models) {
        invoice.belongsTo(models.DocumentType, { foreignKey: 'document_type_id', as: 'documentType' });
        invoice.belongsTo(models.Document, { foreignKey: 'parent_id', as: 'parent' });
        invoice.belongsTo(models.Store, { foreignKey: 'foreign_store_id', as: 'foreignStore' });
        invoice.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        invoice.belongsTo(models.Store, { foreignKey: 'store_id', as: 'store' });
        invoice.belongsTo(models.Currency, { foreignKey: 'currency_id', as: 'currency' });
        invoice.belongsTo(models.Company, {
            foreignKey: 'sellerable_id',
            constraints: false,
            as: 'sellerable',
        });
        invoice.belongsTo(models.Company, {
            foreignKey: 'buyerable_id',
            constraints: false,
            as: 'buyerable',
        });
        invoice.hasMany(models.DocumentLine, { foreignKey: 'document_id', as: 'documentLines' });
        invoice.hasMany(models.TransferOut, { foreignKey: 'parent_id', as: 'children' });
    };
    return invoice;
};
