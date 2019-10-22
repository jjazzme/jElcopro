'use strict';

import db from '../models/index';
const Op = db.Sequelize.Op;

import Entity from './Entity';

const Producer = require('../models').Producer;
const Product = require('../models').Product;

export default class ProducerService extends Entity {

    constructor() {
        super(Producer);
        this._includes = [{ model: Producer, as: 'rightProducer' }];
        this._right = 'rightProducer';
    }

    /**
     * Before Update or Create
     * @param producer
     * @param t
     * @returns {Promise<void>}
     */
    async beforeUpdateOrCreate(producer, t) {
        const changes = producer.changed();
        if (changes && changes.includes('right_producer_id')) {
            if (producer.previous('right_producer_id')) {
                if (producer.right_producer_id) {
                    await Producer.update(
                        {right_producer_id: producer.right_producer_id},
                        {
                            where: {
                                right_producer_id: producer.previous('right_producer_id'),
                                id: {[Op.ne]: producer.id}
                            },
                            transaction: t
                        },
                    );
                    await Product.update(
                        {producer_id: producer.right_producer_id},
                        {where: {producer_id: producer.previous('right_producer_id')}, transaction: t},
                    )
                } else {
                    await Producer.update(
                        {right_producer_id: producer.id},
                        {
                            where: {
                                [Op.or]: [
                                    {
                                        right_producer_id: producer.previous('right_producer_id'),
                                        id: {[Op.ne]: producer.id}
                                    },
                                    {
                                        id: producer.previous('right_producer_id')
                                    }
                                ]
                            },
                            transaction: t
                        },
                    );
                    await Product.update(
                        {producer_id: producer.id},
                        {where: {producer_id: producer.previous('right_producer_id')}, transaction: t},
                    )
                }
            } else if (producer.id) {
                await Product.update(
                    {producer_id: producer.right_producer_id},
                    {where: {producer_id: producer.id}, transaction: t},
                )
            }
        }
    }
}