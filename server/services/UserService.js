import { User } from '../models';
import Entity from './Entity';

export default class UserService extends Entity {
    constructor() {
        super(User);
    }
}
