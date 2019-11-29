#!/usr/bin/env node
import app from './index';

const { DocumentLine, TransferIn } = app.services.db.models;

app.services.dbConnection.transaction(async () => {
    const transferIn = await TransferIn
        .getInstance({ number: 1, number_prefix: 'TEST' }, 'deepDocumentLines', 'withParent');
    let destroys = transferIn.documentLines
        .filter((line) => line.arrival)
        .map((line) => line.arrival.destroy());
    await Promise.all(destroys);
    destroys = transferIn.documentLines.map((line) => line.destroy());
    await Promise.all(destroys);
    const order = transferIn.parent;
    await transferIn.destroy();
    destroys = (await order.getDocumentLines()).map((line) => line.destroy());
    await Promise.all(destroys);
    await order.destroy();
}).then(() => console.log('Data Clear'));