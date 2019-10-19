'use strict';

import db from '../models/index';
const Op = db.Sequelize.Op;

const Producer = require('../models').Producer;
const Product = require('../models').Product;

export default {
    /**
     *
     * @param newProducer
     * @returns {Promise<Object>}
     */
    async updateOrCreate(newProducer) {
        let producer = undefined;
        const t = await db.sequelize.transaction();
        try {
            if (newProducer.id) {
                producer = await Producer.findOne({ where : { id: newProducer.id }, transaction: t })
            } else if (newProducer.name) {
                producer = await Producer.findOne({ where : { name: newProducer.name }, transaction: t })
            }
            if (!producer) {
                producer = await Producer.create(newProducer, { transaction: t })
            } else {
                producer.set(newProducer);
                const changes = producer.changed();
                if (changes && changes.includes('right_producer_id')) {
                    await this.changeRightProducerId(producer, t)
                }
                await producer.save({ transaction: t });
            }
            await t.commit();
        } catch (e) {
            await t.rollback();
            throw new Error('Операция не проперла')
        }
        return producer;
    },

    /**
     *
     * @param producer
     * @param t
     * @returns {Promise<void>}
     */
    async changeRightProducerId(producer, t) {
        if (producer.previous('right_producer_id')) {
            if (producer.right_producer_id) {
                await Producer.update(
                    { right_producer_id: producer.right_producer_id },
                    {
                        where: {
                            right_producer_id: producer.previous('right_producer_id'),
                            id: { [Op.ne]: producer.id }
                        }
                    },
                    { transaction: t }
                );
                await Product.update(
                    { producer_id: producer.right_producer_id },
                    { where: { producer_id: producer.previous('right_producer_id') }},
                    { transaction: t }
                )
            } else {
                await Producer.update(
                    { right_producer_id: producer.id },
                    {
                        where: {
                            [Op.or]: [
                                {
                                    right_producer_id: producer.previous('right_producer_id'),
                                    id: { [Op.ne]: producer.id }
                                },
                                {
                                    id: producer.previous('right_producer_id')
                                }
                            ]
                        }
                    },
                    { transaction: t }
                );
                await Product.update(
                    { producer_id: producer.id },
                    { where: { producer_id: producer.previous('right_producer_id') }},
                    { transaction: t }
                )
            }
        } else {
            await Product.update(
                { producer_id: producer.right_producer_id },
                { where: { producer_id: producer.id }},
                { transaction: t }
            )
        }
    }
}