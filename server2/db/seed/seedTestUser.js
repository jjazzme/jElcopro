import app from '../../index';

const { User } = app.services.db.models;

module.exports.run = async () => {
    const users = [
        {
            email: 'elcopro@gmail.com',
            password: '123456',
            options: {},
        },
        {
            email: 'me@don.ru',
            password: '123456',
            options: {},
        },
    ];
    users.forEach((user) => User.findOrCreate({ where: { name: 'Test' }, defaults: user }));
};
