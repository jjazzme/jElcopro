import bcrypt from 'bcrypt';
import app from '../../index';

const { User } = app.services.db.models;

module.exports.run = async () => {
    const users = [
        {
            email: 'elcopro@gmail.com',
            password: bcrypt.hashSync('123456', bcrypt.genSaltSync()),
            options: {},
        },
    ];
    users.forEach((user) => User.findOrCreate({ where: { name: 'Test' }, defaults: user }));
};
