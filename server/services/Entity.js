import db from '../models/index';

export default class Entity {

    _Entity = undefined;
    _transaction = undefined;
    _includes = [];

    constructor(Entity) {
        this._Entity = Entity;
    }

    /**
     *  Get transaction
     * @returns {Promise<undefined>}
     */
    async transaction() {
        if (!this._transaction) {
            this._transaction = await db.sequelize.transaction();
        }
        return this._transaction;
    }

    /**
     * Find by id or attributes in searchItem
     * @param searchItem
     * @returns {Promise<*>}
     */
    async find(searchItem) {
        let item = undefined;
        if (searchItem.id) {
            item = await this._Entity.findOne({ where : { id: searchItem.id }, include: this._includes });
        } else {
            item = await this._Entity.findOne({ where : searchItem, include: this._includes });
        }
        return item;
    }

    /**
     * Save new instance in DB with triggers
     * @param item
     * @returns {Promise<Object>}
     */
    async create(item) {
        const t = await this.transaction();
        if (!(item instanceof this._Entity)) {
            item = this._Entity.build(item);
        }
        try {
            if (this.beforeCreate) {
                await this.beforeCreate(item, t);
            }
            if (this.beforeUpdateOrCreate) {
                await this.beforeUpdateOrCreate(item, t);
            }
            await item.save({ transaction: t });
            if (this.afterCreate) {
                await this.afterCreate(item, t);
            }
            if (this.afterUpdateOrCreate) {
                await this.afterUpdateOrCreate(item, t);
            }
            await t.commit();
        } catch (e) {
            await t.rollback();
            throw e
        }
        return (await this.find({ id: item.id }));
    }

    /**
     * Replace instance in DB with triggers
     * @param item
     * @returns {Promise<Object>}
     */
    async update(item) {
        const t = await this.transaction();
        if (!(item instanceof this._Entity)) {
            const item_by_id = await this._Entity.findOne({ where : { id: item.id } });
            item = item_by_id.set(item);
        }
        try {
            if (this.beforeUpdate) {
                await this.beforeUpdate(item, t);
            }
            if (this.beforeUpdateOrCreate) {
                await this.beforeUpdateOrCreate(item, t);
            }
            await item.save({transaction: t});
            if (this.afterUpdate) {
                await this.afterUpdate(item, t);
            }
            if (this.afterUpdateOrCreate) {
                await this.afterUpdateOrCreate(item, t);
            }
            await t.commit();
        } catch (e) {
            await t.rollback();
            throw e
        }
        return (await this.find({ id: item.id }));
    }

    /**
     * Destroy instance with triggers
     * @param item
     * @returns {Promise<void>}
     */
    async destroy(item) {
        const t = await this.transaction();
        if (!(item instanceof this._Entity)) {
            item = await this._Entity.findOne({ where : { id: item.id } });
        }
        try {
            if (this.beforeDestroy) {
                await this.beforeDestroy(item, t);
            }
            await item.destroy({transaction: t});
            if (this.afterDestroy) {
                await this.afterDestroy(item, t);
            }
            await this.transaction().commit();
        } catch (e) {
            await this.transaction().rollback();
            throw e
        }
    }

    /**
     * Update or Create with find
     * @param searchItem
     * @param newItem
     * @returns {Promise<Object>}
     */
    async updateOrCreate(searchItem, newItem) {
        let item = await this.find(searchItem);
        Object.assign(searchItem, newItem);
        if (!item) {
            item = this._Entity.build(searchItem);
            item = await this.create(item)
        } else {
            item.set(searchItem);
            item = await this.update(item);
        }
        return item;
    }

    async firstOrNew(newItem) {
        let item = await this.find(newItem);
        if (!item) {
            item = this._Entity.build(searchItem);
        }
        return item;
    }

    /**
     * Return current Entity
     * @returns {*}
     */
    getEntity() {
        return this._Entity;
    }
}