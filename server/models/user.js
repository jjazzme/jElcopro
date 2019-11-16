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
        }
    }, {
        freezeTableName: true,
        tableName: 'users',
    });
    user.associate = function (models) {

    };
    return user;
};
