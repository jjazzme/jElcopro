import ModelService from './ModelService';
import db from '../models';

const { FutureReserve } = db;

export default class FutureReserveService extends ModelService {
    constructor() {
        super(FutureReserve);
    }
}
