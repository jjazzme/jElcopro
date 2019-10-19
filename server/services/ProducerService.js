'use strict';

import db from '../models/index';
const Op = db.Sequelize.Op;

import Entity from './Entity';

const Producer = require('../models').Producer;
const Product = require('../models').Product;

export default {
    /**
     *
     * @param newProducer
     * @returns {Promise<Object>}
     */
    async updateOrCreate(newProducer) {
        const entity = new Entity(Producer);
        return (await entity.updateOrCreate(newProducer, { before: this.changeRightProducerId }));
    },

    /**
     *
     * @param producer
     * @param t
     * @returns {Promise<void>}
     */
    async changeRightProducerId(producer, t) {
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