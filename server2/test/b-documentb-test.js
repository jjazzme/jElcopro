// import _ from 'lodash';
import app from '../index';

const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;

describe('Test Corrective', () => {
    const {
        MovementOut, MovementIn,
    } = app.services.db.models;
    // const { transition } = app.services;
    let out;
    let movementIn;
    before(async () => {
        out = await MovementOut.getInstance({ number_prefix: 'TEST' });
    });
    it('Create MovementIn', async () => {
        movementIn = await MovementIn.createFromOptics({ parent_id: out.id, number_prefix: 'TEST' });
        expect(movementIn, 'Its MovementIn').to.be.an.instanceof(MovementIn).and.deep.include({ status_id: 'formed' });
    });
});
