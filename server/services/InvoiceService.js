import DocumentService from './DocumentService';
import { Invoice } from '../models';
// import Transaction from "sequelize";

export default class InvoiceService extends DocumentService {
    constructor() {
        super(Invoice);
        this._transitions = [
            { name: 'reserve', from: 'formed', to: 'reserved' },
            { name: 'unreserve', from: 'reserved', to: 'formed' },
            { name: 'toWork', from: 'reserved', to: 'in_work' },
            { name: 'unWork', from: 'in_work', to: 'reserved' },
            { name: 'close', from: 'in_work', to: 'closed' },
        ];
        this._instance = { status_id: 'reserved' };
    }

    // eslint-disable-next-line class-methods-use-this
    async reserve(params) {
        // const t = new Transaction();
        //
        await new Promise((resolve) => setTimeout(resolve, 5000));
        console.log(`It reserved ${params.own}`);
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this
    async unreserve() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('It not unreserved');
        return Promise.reject();
    }

    // eslint-disable-next-line class-methods-use-this
    async toWork() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('It toWork');
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this
    async unWork() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('It unWork');
        return Promise.resolve();
    }

    // eslint-disable-next-line class-methods-use-this
    async close() {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('It not close');
        return Promise.reject();
    }
}
