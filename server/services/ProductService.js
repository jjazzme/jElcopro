'use strict';

import Entity from './Entity';
import { Producer, Product, Category, Picture } from '../models';

export default class ProductService extends Entity {

    constructor() {
        super(Product);
        this._includes = [{ model: Producer }, { model: Category }, { model: Picture }]
    }

    /**
     * Before Update or Create
     * @param product
     * @returns {Promise<void>}
     */
    async beforeUpdateOrCreate(product){
        const changes = product.changed();
        if (product.right_product_id && changes && changes.includes('right_product_id')) {
            const right_product = await Product.findOne({ where: { id: product.right_product_id }});
            if (right_product.right_product_id) {
                throw new Error('Правильный продукт - неправильный!')
            }
        }
        if (changes && changes.includes('name')) {
            product.name = product.name.toString();
            product.search_name = this.makeSearchName(name);
        }
    }

    /**
     * Make Search Name
     * @param name
     * @returns {string}
     */
    static makeSearchName(name) {
        return name ? name.toString().replace(/[^0-9A-Za-zА-Яа-я]/g, '') : '';
    }

}