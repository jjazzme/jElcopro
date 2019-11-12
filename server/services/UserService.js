import { User } from '../models';
import ModelService from './ModelService';

export default class UserService extends ModelService {
    constructor() {
        super(User);
    }
}
