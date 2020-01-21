import Document from './DocumentModel';

export default class Invoice extends Document {
    transitions = [
        { name: 'reserve', from: 'formed', to: 'reserved' },
        { name: 'unreserve', from: 'reserved', to: 'formed' },
        { name: 'toWork', from: 'reserved', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'reserved' },
        { name: 'closeReserves', from: 'in_work', to: 'in_work' },
        { name: 'openReserves', from: 'in_work', to: 'in_work' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];
}
