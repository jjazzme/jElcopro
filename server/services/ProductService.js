'use strict';

import Entity from './Entity';

const Product = require('../models').Product;

export default class ProductService extends Entity {

    constructor() {
        super(Product);
    }

    /**
     * Before Update or Create
     * @param product
     * @returns {Promise<void>}
     */
    async before(product){
        const changes = product.changed();
        if (product.right_product_id && changes && changes.includes('right_product_id')) {
            const right_product = await Product.findOne({ where: { id: product.right_product_id }});
            if (right_product.right_product_id) {
                throw new Error('Правильный продукт - неправильный!')
            }
        }
        if (changes && changes.includes('name')) {
            product.search_name = product.name.replace(/[^0-9A-Za-zА-Яа-я]/g, '')
        }
    }
}