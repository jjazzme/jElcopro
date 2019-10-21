'use strict'

module.exports = (sequelize, DataTypes) => {
    var documentType = sequelize.define('documentType', {
      id: {
          type: DataTypes.STRING,
          primaryKey: true
      },
        name: DataTypes.STRING
    }, {
        freezeTableName: true,
        tableName: 'document_types',
        uniqueKeys: {
            document_types_name_unique: {
                fields: ['name']
            }
        }
    });
    documentType.associate = function (models) {

    };
    return documentType;
};