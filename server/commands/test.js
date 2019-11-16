import OrderService from '../services/OrderService';
import DocumentLineService from '../services/DocumentLineService';
import InvoiceService from '../services/InvoiceService';
import TransferInService from '../services/TransferInService';
import TransferOutService from '../services/TransferOutService';

// eslint-disable-next-line no-unused-vars
module.exports.run = async (args) => {
    const transferInService = new TransferInService();
    const documentLineService = new DocumentLineService();
    const invoiceService = new InvoiceService();
    const orderService = new OrderService();
    const transferOutService = new TransferOutService();

    let invoice = await invoiceService.find({ number: 2, number_prefix: 'TEST' });
    invoiceService.destroy(invoice);
    invoice = await invoiceService.find({ number: 1, number_prefix: 'TEST' });

    const transferOut = await transferOutService.find({ parent_id: invoice.id });
    await Promise.all(transferOut.documentLines.map((line) => documentLineService.destroy(line)));
    await transferOutService.destroy(transferOut);

    await invoiceService.setInstance(invoice);
    await invoiceService.openReserves(invoice);
    await invoiceService.transition('unreserve');
    await Promise.all(invoice.documentLines.map((line) => documentLineService.destroy(line)));
    await invoiceService.destroy(invoice);

    let transferIn = await transferInService.find({ number: 2, number_prefix: 'TEST' });
    await transferInService.setInstance(transferIn);
    await transferInService.transition('unWork');
    await Promise.all(transferIn.documentLines.map((line) => documentLineService.destroy(line)));
    transferInService.destroy(transferIn);

    transferIn = await transferInService.find({ number: 1, number_prefix: 'TEST' });
    await transferInService.setInstance(transferIn);
    await transferInService.transition('unWork');
    await Promise.all(transferIn.documentLines.map((line) => documentLineService.destroy(line)));
    await transferInService.destroy(transferIn);

    const order = await orderService.find({ number: 1, number_prefix: 'TEST' });
    await orderService.setInstance(order);
    await orderService.transition('unWork');
    await Promise.all(order.documentLines.map((line) => documentLineService.destroy(line)));
    await orderService.destroy(order);
};
