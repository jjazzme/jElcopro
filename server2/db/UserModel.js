import bcrypt from 'bcrypt';
import BaseModel from './BaseModel';

export default class User extends BaseModel {
    comparePassword(password) {
        return this.password === bcrypt.hashSync(password, this.salt);
    }
}
