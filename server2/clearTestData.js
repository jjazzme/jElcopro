#!/usr/bin/env node
import app from './index';

const {
    Invoice, Order, TransferIn, TransferOut, TransferOutCorrective, TransferInCorrective, Defective, Good, Arrival,
    FutureReserve, Reserve, Undefective, Movement, MovementOut, MovementIn,
} = app.services.db.models;
const { transition, logger } = app.services;
let destroys;

class State {
    constructor(goodId) {
        this.goodId = goodId;
    }

    async refresh() {
        const arrivals = await Arrival.findAll();
        const futureReserves = await FutureReserve.findAll();
        const reserves = await Reserve.findAll();
        this.good = await Good.getInstance(this.goodId);
        this.arrivalsCount = arrivals.reduce((sum, a) => sum + a.ballance, 0);
        this.futureReserevesCount = futureReserves.reduce((sum, f) => sum + f.ballance, 0);
        this.reservesCount = reserves.reduce((sum, r) => sum + r.quantity, 0);
    }
}

const state = new State(60164);

app.services.dbConnection.transaction(async (transaction) => {
    await state.refresh();
    const good = await Good.getInstance(60164, 'withProduct');
    logger.info(
        {
            good_id: good.id,
            product_name: good.product.name,
            ballance: good.ballance,
            integrity: await good.arrivalsCheck(),
            reserves: await good.reservesQuantity(),
            future_reserves: await good.futureReservesBallance(),
        },
        'GoodInfo',
    );
    const movementIn = await MovementIn.findOne({ where: { number_prefix: 'TEST' } });
    if (movementIn) {
        const lines = await movementIn.getDocumentLines();
        await Promise.all(lines.map((line) => line.destroy()));
        await movementIn.destroy();
    }
    const movementOut = await MovementOut.findOne({ where: { number_prefix: 'TEST' } });
    if (movementOut) {
        await transition.execute('unWork', movementOut, { transaction });
        const lines = await movementOut.getDocumentLines();
        await Promise.all(lines.map((line) => line.destroy()));
        await movementOut.destroy();
    }
    const movement = await Movement.findOne({ where: { number_prefix: 'TEST' } });
    if (movement) {
        await transition.execute('openReserves', movement, { transaction });
        await transition.execute('unWork', movement, { transaction });
        await transition.execute('unreserve', movement, { transaction });
        const lines = await movement.getDocumentLines();
        await Promise.all(lines.map((line) => line.destroy()));
        await movement.destroy();
    }
    const undefective = await Undefective.findOne({ where: { number_prefix: 'TEST' } });
    if (undefective) {
        await transition.execute('unWork', undefective, { transaction });
        const lines = await undefective.getDocumentLines();
        await Promise.all(lines.map((line) => line.destroy()));
        await undefective.destroy();
    }
    const defectives = await Defective
        .scope('defaultScope', 'withDocumentLines')
        .findAll({ where: { number_prefix: 'TEST' } });
    // eslint-disable-next-line no-unused-vars
    for (const defective of defectives) {
        if (defective.status_id === 'in_work') await transition.execute('unWork', defective, { transaction });
        await defective.reload();
        await Promise.all(defective.documentLines.map((line) => line.destroy()));
        await defective.destroy();
    }
    const inv = await Invoice.getInstance({ number_prefix: 'TEST', status_id: 'in_work' });
    if (inv) {
        await transition.execute('unWork', inv, { transaction });
        await transition.execute('unreserve', inv, { transaction });
    }
    const transferInCorrective = await TransferInCorrective
        .scope('defaultScope', 'withDocumentLines')
        .findOne({ where: { number_prefix: 'TEST' } });
    if (transferInCorrective) {
        await transition.execute('unWork', transferInCorrective, { transaction });
        await transferInCorrective.reload();
        await transferInCorrective.documentLines[0].destroy();
        await transferInCorrective.destroy();
    }
    const transferOutCorrective = await TransferOutCorrective
        .scope('defaultScope', 'withDocumentLines')
        .findOne({ where: { number_prefix: 'TEST' } });
    if (transferOutCorrective) {
        await transition.execute('unWork', transferOutCorrective, { transaction });
        await transition.execute('unreserve', transferOutCorrective, { transaction });
        await transferOutCorrective.reload();
        await transferOutCorrective.documentLines[0].destroy();
        await transferOutCorrective.destroy();
    }
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
        if (invoice.status_id === 'formed') {
            await transition.execute('reserve', invoice, { transaction });
        }
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
        destroys = transferIn.documentLines.map(async (line) => {
            await line.reload();
            return line.destroy();
        });
        await Promise.all(destroys);
        await transferIn.destroy();
    }
    const order = await Order.getInstance({ number_prefix: 'TEST' });
    if (order) {
        await transition.execute('unWork', order, { transaction });
        destroys = (await order.getDocumentLines()).map((line) => line.destroy());
        await Promise.all(destroys);
        await order.destroy();
    }
}).then(() => logger.info({}, 'Data Clear'));
