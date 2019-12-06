import BaseModel from './BaseModel';

const makeSearchName = (name) => (name ? name.toString().replace(/[^0-9A-Za-zА-Яа-я]/g, '') : '');

export default class Product extends BaseModel {
    static registerHooks() {
        this.beforeSave(async (product) => {
            const changes = product.changed();
            if (product.right_product_id && changes && changes.includes('right_product_id')) {
                const rightProduct = await Product.findOne({ where: { id: product.right_product_id } });
                if (rightProduct.right_product_id) {
                    throw new Error('Правильный продукт - неправильный!');
                }
            }
            if (changes && changes.includes('name')) {
                product.name = product.name.toString();
                product.search_name = makeSearchName(product.name);
            }
        });
        return this;
    }

    static makeSearchName(name) {
        return makeSearchName(name);
    }
}
