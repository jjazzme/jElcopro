import BaseModel from './BaseModel';

export default class Shipment extends BaseModel {
    transitions = [
        { name: 'toTransit', from: 'formed', to: 'transit' },
        { name: 'unTransit', from: 'transit', to: 'formed' },
        { name: 'arrive', from: 'transit', to: 'arrival' },
        { name: 'close', from: 'arrival', to: 'closed' },
    ];
}
