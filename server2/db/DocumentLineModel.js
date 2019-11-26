import BaseModel from './BaseModel';

export default class DocumentLine extends BaseModel {
    /**
     * Parent quantity must more then sum quantity children
     */
    async checkChildrenQuantity() {
        this.children = this.children || await this.getChildren();
        if (this.children.length > 0) {
            const sumQuantity = this.children.reduce((sum, child) => sum + child.quantity, 0);
            if (this.quantity < sumQuantity) {
                throw new Error(`${this.quantity} less than possible ${sumQuantity}`);
            }
        }
    }

    /**
     * Sum quantity children lines must less then parent quantity
     */
    async checkParentQuantity() {
        if (this.parent_id) {
            this.parent = this.parent || await this.getParent();
            const previousQuantity = this.previous('quantity') ? this.previous('quantity') : 0;
            const sumQuantity = this.parent.children.reduce((sum, child) => sum + child.quantity, 0)
                - previousQuantity + this.quantity;
            if (sumQuantity > this.parent.quantity) {
                const possibleQuantity = this.parent.quantity - sumQuantity + this.quantity;
                throw new Error(`${this.quantity} more than possible ${possibleQuantity}`);
            }
        }
    }

    static registerHooks() {
        /**
          * Before Create new DocumentLine resolve dependencies on right Good & Store
          */
        this.beforeCreate(async (line) => {
            const { Good } = this.services.db.models;
            if (!line.document_id) throw new Error('Attribute document_id required');
            const document = line.document || await line.getDocument();
            if (!document) throw new Error('Attribute document_id wrong');
            const productId = line.product_id || (await Good.getInstance({ id: line.good_id })).product_id;
            const good = await Good.getInstanceOrCreate(
                { product_id: productId, store_id: document.store_id, code: productId },
                {
                    pack: 1, multiply: 1, is_active: true, ballance: 0,
                },
            );
            line.store_id = document.store_id;
            line.from_good_id = line.good_id;
            line.good_id = good.id;
        });
        /**
         * Check quantity and re-sum before update or create;
         */
        this.beforeSave(async (line) => {
            const changes = line.changed();
            if (changes && changes.includes('quantity')) {
                await line.checkParentQuantity();
                await line.checkChildrenQuantity();
                if (!changes.includes('amount_without_vat')) {
                    line.amount_without_vat = line.price_without_vat * line.quantity;
                }
                if (!changes.includes('amount_with_vat')) {
                    line.amount_with_vat = line.price_with_vat * line.quantity;
                }
            }
        });
        return this;
    }
}
