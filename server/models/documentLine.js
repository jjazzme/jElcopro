module.exports = (sequelize, DataTypes) => {
    const documentLine = sequelize.define('DocumentLine', {
        document_id: DataTypes.INTEGER,
        parent_id: DataTypes.INTEGER,
        good_id: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,
        vat: DataTypes.DECIMAL(8, 2),
        price_without_vat: DataTypes.DECIMAL(18, 6),
        price_with_vat: DataTypes.DECIMAL(18, 6),
        amount_without_vat: DataTypes.DECIMAL(18, 6),
        amount_with_vat: DataTypes.DECIMAL(18, 6),
        store_id: DataTypes.INTEGER,
        times: DataTypes.INTEGER,
        state_customs_declaration_id: DataTypes.INTEGER,
        remark: DataTypes.STRING,
        closed: { type: DataTypes.BOOLEAN, defaultValue: false },
        from_good_id: DataTypes.INTEGER,
    }, {
        freezeTableName: true,
        tableName: 'document_lines',
    });
    documentLine.associate = function (models) {
        documentLine.belongsTo(models.Document, { foreignKey: 'document_id', as: 'document' });
        documentLine.belongsTo(models.DocumentLine, { foreignKey: 'parent_id', as: 'parent' });
        documentLine.hasMany(models.DocumentLine, { foreignKey: 'parent_id', as: 'children' });
        documentLine.belongsTo(models.Good, { foreignKey: 'good_id', as: 'good' });
        documentLine.belongsTo(models.Store, { foreignKey: 'store_id', as: 'store' });
        documentLine.belongsTo(models.StateCustomsDeclaration,
            { foreignKey: 'state_customs_declaration_id', as: 'stateCustomsDeclaration' });
        documentLine.belongsTo(models.Good, { foreignKey: 'from_good_id', as: 'fromGood' });
        documentLine.hasOne(models.Arrival, { foreignKey: 'document_line_id', as: 'arrival' });
        documentLine.hasOne(models.Departure, { foreignKey: 'document_line_id', as: 'departure' });
        documentLine.hasOne(models.FutureReserve, { foreignKey: 'document_line_id', as: 'futureReserve' });
        documentLine.hasMany(models.Reserve, { foreignKey: 'document_line_id', as: 'reserves' });
    };
    return documentLine;
};
