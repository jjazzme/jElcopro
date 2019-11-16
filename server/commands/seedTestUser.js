import bcrypt from 'bcrypt';
import UserService from '../services/UserService';

module.exports.run = async () => {
    const users = [
        {
            email: 'elcopro@gmail.com',
            password: bcrypt.hashSync('123456', bcrypt.genSaltSync()),
            options: {},
        },
    ];
    const service = new UserService();
    users.forEach((user) => service.firstOrCreate({ name: 'Test' }, user));
};
