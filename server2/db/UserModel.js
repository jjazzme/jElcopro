import bcrypt from 'bcrypt';
import BaseModel from './BaseModel';

export default class User extends BaseModel {
    comparePassword(password) {
        const bcPass = bcrypt.hashSync(password, this.salt);
        return this.password === bcPass;
    }
}
