import app from '../index';

const chai = require('chai');
chai.use(require('chai-string'));

const { expect } = chai;

describe('PriceService searchByNameOnStore:', () => {
    it('1', async () => {
        const { Order } = app.services.db.models;
        const order = await Order.getInstance(147);
        await app.services.transition.applay('close', order);
    });
});
