#!/usr/bin/env node
import app from './index';

const {
    Invoice, Order, TransferIn, TransferOut,
} = app.services.db.models;
const { transition } = app.services;

app.services.dbConnection.transaction(async (transaction) => {
    let destroys;
    const transferOuts = await TransferOut
        .scope('defaultScope', 'withDocumentLines')
        .findAll({ where: { number_prefix: 'TEST' } });
    // eslint-disable-next-line no-unused-vars
    for (const transferOut of transferOuts) {
        if (transferOut.status_id === 'in_work') {
            await transition.execute('unWork', transferOut, { transaction });
        }
        destroys = transferOut.documentLines.map(async (line) => {
            await line.reload();
            return line.destroy();
        });
        await Promise.all(destroys);
        await transferOut.destroy();
    }
    const invoices = await Invoice
        .scope('defaultScope', 'withDocumentLines')
        .findAll({ where: { number_prefix: 'TEST' } });
    // eslint-disable-next-line no-unused-vars
    for (const invoice of invoices) {
        if (invoice.status_id === 'reserved') {
            await transition.execute('toWork', invoice, { transaction });
        }
        if (invoice.status_id === 'in_work') {
            await transition.execute('openReserves', invoice, { transaction });
            // await invoice.openReserves(transaction);
            await transition.execute('unWork', invoice, { transaction });
        }
        if (invoice.status_id === 'reserved') {
            await transition.execute('unreserve', invoice, { transaction });
        }
        destroys = invoice.documentLines.map((line) => line.destroy());
        await Promise.all(destroys);
        await invoice.destroy();
    }
    const transferIns = await TransferIn
        .scope('defaultScope', 'deepDocumentLines', 'withParent')
        .findAll({ where: { number_prefix: 'TEST' } });
    // eslint-disable-next-line no-unused-vars
    for (const transferIn of transferIns) {
        if (transferIn.status_id === 'in_work') {
            await transition.execute('unWork', transferIn, { transaction });
        }
        /* destroys = transferIn.documentLines
            .filter((line) => line.arrival)
            .map((line) => line.arrival.destroy());
        await Promise.all(destroys); */
        destroys = transferIn.documentLines.map(async (line) => {
            await line.reload();
            return line.destroy();
        });
        await Promise.all(destroys);
        await transferIn.destroy();
    }
    const order = await Order.getInstance({ number_prefix: 'TEST' });
    await transition.execute('unWork', order, { transaction });
    destroys = (await order.getDocumentLines()).map((line) => line.destroy());
    await Promise.all(destroys);
    await order.destroy();
}).then(() => console.log('Data Clear'));
