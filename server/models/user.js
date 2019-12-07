module.exports = function (sequelize, Sequelize) {
    const user = sequelize.define('User', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING,
            notEmpty: true,
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        options: {
            type: Sequelize.JSON,
        },
        avatar: {
            type: Sequelize.STRING,
        },
        skills: {
            type: Sequelize.JSON,
            defaultValue: {"interface": 0, "sales": 0, "computer": 0},
        },
        cards: {
            type: Sequelize.JSON,
            defaultValue: {"invoice": null, "orders": []},
        }
    }, {
        freezeTableName: true,
        tableName: 'users',
        defaultScope: {
            attributes: { exclude: ['password'] },
        }
    });
    user.associate = function (models) {

    };
    user.getById = function(id) {return user.findByPk(id)};
    return user;
};
