import ModelService from './ModelService';
import db from '../models';

const { Reserve } = db;

export default class ReserveService extends ModelService {
    constructor() {
        super(Reserve);
    }
}
