'use strict';

const Producer = require('../models').Producer;

export default {
    async updateOrCreate(newProducer) {
        let producer = undefined;
        if (newProducer.id) {
            producer = await Producer.findOne({ where : { id: newProducer.id }})
        }
        if (!producer) {
            producer = await Producer.create(newProducer)
        } else {
            producer.set(newProducer);
            console.dir(producer);
            console.log(producer.changed());
        }
        return producer;
    }
}