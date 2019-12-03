#!/usr/bin/env node
import app from './index';

const { Invoice, Order, TransferIn } = app.services.db.models;
const { transition } = app.services;

app.services.dbConnection.transaction(async (transaction) => {
    const invoices = await Invoice
        .scope('defaultScope', 'withDocumentLines')
        .findAll({ where: { number_prefix: 'TEST' } });
    // eslint-disable-next-line no-unused-vars
    for (const invoice of invoices) {
        if (invoice.status_id === 'reserved') {
            await transition.execute('unreserve', invoice, { transaction });
        }
        const destroys = invoice.documentLines.map((line) => line.destroy());
        await Promise.all(destroys);
        await invoice.destroy();
    }
    const transferIns = await TransferIn
        .scope('defaultScope', 'deepDocumentLines', 'withParent')
        .findAll({ where: { number_prefix: 'TEST' } });
    let destroys;
    // eslint-disable-next-line no-unused-vars
    for (const transferIn of transferIns) {
        destroys = transferIn.documentLines
            .filter((line) => line.arrival)
            .map((line) => line.arrival.destroy());
        await Promise.all(destroys);
        destroys = transferIn.documentLines.map(async (line) => {
            await line.reload();
            return line.destroy();
        });
        await Promise.all(destroys);
        await transferIn.destroy();
    }
    const order = await Order.getInstance({ number_prefix: 'TEST' });
    destroys = (await order.getDocumentLines()).map((line) => line.destroy());
    await Promise.all(destroys);
    await order.destroy();
}).then(() => console.log('Data Clear'));
