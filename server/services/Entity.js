import Transaction from 'sequelize';
import db from '../models/index';

export default class Entity {
    /**
     * Model class
     * @type Object
     * @private
     */
    _Entity = undefined;

    /**
     *  Model instance if need
     */
    _instance;

    /**
     * Includes for Find
     * @type {Array}
     * @private
     */
    _includes = [];

    /**
     * Attribute name for right instance
     * @type {string}
     * @private
     */
    _right = undefined;

    constructor(entity) {
        this._Entity = entity;
        this._instance = null;
    }

    /**
     * Find by id or attributes in searchItem & return right instance if possible
     * @param searchItem
     * @returns {Promise<*>}
     */
    async find(searchItem) {
        let item;
        if (searchItem.id) {
            item = await this._Entity.findOne({ where: { id: searchItem.id }, include: this._includes });
        } else {
            try {
                item = await this._Entity.findOne({ where: searchItem, include: this._includes });
            } catch (e) {
                console.error(e);
            }
        }
        return item && this._right && item[this._right] ? item[this._right] : item;
    }

    /**
     * Save new instance in DB with triggers
     * @param item
     * @param transaction {Transaction}
     * @returns {Promise<Object>}
     */
    async create(item, transaction) {
        const t = transaction instanceof Transaction ? transaction : await db.sequelize.transaction();
        const createItem = item instanceof this._Entity ? item : this._Entity.build(item);
        try {
            if (this.beforeCreate) {
                await this.beforeCreate(createItem, t);
            }
            if (this.beforeUpdateOrCreate) {
                await this.beforeUpdateOrCreate(createItem, t);
            }
            await createItem.save({ transaction: t });
            if (this.afterCreate) {
                await this.afterCreate(createItem, t);
            }
            if (this.afterUpdateOrCreate) {
                await this.afterUpdateOrCreate(createItem, t);
            }
            if (!transaction) await t.commit();
            return await this.find({ id: createItem.id });
        } catch (e) {
            console.warn('Problem with create', this._Entity, item, e);
            if (!transaction) await t.rollback();
            throw e;
        }
    }

    /**
     * Replace instance in DB with triggers
     * @param item
     * @param transaction {Transaction}
     * @returns {Promise<Object>}
     */
    async update(item, transaction) {
        const t = transaction instanceof Transaction ? transaction : await db.sequelize.transaction();
        const updateItem = item instanceof this._Entity ? item : await this._Entity.findOne({ where: { id: item.id } });
        if (!(item instanceof this._Entity)) {
            updateItem.set(item);
        }
        try {
            if (this.beforeUpdate) {
                await this.beforeUpdate(updateItem, t);
            }
            if (this.beforeUpdateOrCreate) {
                await this.beforeUpdateOrCreate(updateItem, t);
            }
            await updateItem.save({ transaction: t });
            if (this.afterUpdate) {
                await this.afterUpdate(updateItem, t);
            }
            if (this.afterUpdateOrCreate) {
                await this.afterUpdateOrCreate(updateItem, t);
            }
            if (!transaction) await t.commit();
            return await this.find({ id: updateItem.id });
        } catch (e) {
            console.warn('Problem with update', this._Entity, item, e);
            if (!transaction) await t.rollback();
            throw e;
        }
    }

    /**
     * Destroy instance with triggers
     * @param item
     * @param transaction {Transaction}
     * @returns {Promise<void>}
     */
    async destroy(item, transaction) {
        const t = transaction instanceof Transaction ? transaction : await db.sequelize.transaction();
        const destroyItem = item instanceof this._Entity
            ? item : await this._Entity.findOne({ where: { id: item.id } });
        try {
            if (this.beforeDestroy) {
                await this.beforeDestroy(destroyItem, t);
            }
            await destroyItem.destroy({ transaction: t });
            if (this.afterDestroy) {
                await this.afterDestroy(destroyItem, t);
            }
            if (!transaction) await this.transaction().commit();
        } catch (e) {
            console.warn('Problem with delete', this._Entity, item, e);
            if (!transaction) await this.transaction().rollback();
            throw e;
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
            item = await this.create(item);
        } else {
            item.set(searchItem);
            item = await this.update(item);
        }
        return item;
    }

    /**
     * First or Create with find
     * @param searchItem
     * @param newItem
     * @returns {Promise<Object>}
     */
    async firstOrCreate(searchItem, newItem) {
        let item = await this.find(searchItem);
        if (!item) {
            Object.assign(searchItem, newItem);
            item = this._Entity.build(searchItem);
            item = await this.create(item);
        }
        return item;
    }

    /**
     * First Or New
     * @param searchItem
     * @param newItem
     * @returns {Promise<Object>}
     */
    async firstOrNew(searchItem, newItem) {
        let item = await this.find(searchItem);
        if (!item) {
            Object.assign(searchItem, newItem);
            item = this._Entity.build(searchItem);
        }
        return item;
    }

    /**
     * Get instance by id, alias or same
     * @param instance
     * @returns {Promise<Object>}
     */
    async getInstance(instance) {
        let answer = null;
        if (typeof instance === 'number') {
            answer = await this.find({ id: instance });
        } else if (typeof instance === 'string' && this.getByAlias) {
            answer = await this.getByAlias(instance);
        } else if (instance instanceof this._Entity) {
            if (this._includes.reduce((flag, item) => !!(flag && item.as && instance[item.as]), true)) {
                answer = instance;
            } else {
                answer = await this.find({ id: instance.id });
            }
        }
        return answer;
    }

    /**
     * Set Instance property
     * @param instance
     * @returns {Promise<void>}
     */
    async setInstance(instance) {
        this._instance = await this.getInstance(instance);
    }

    static async getNew(instance) {
        const ret = new this();
        if (instance) await ret.setInstance(instance);
        return ret;
    }

    /**
     * Return current Entity
     * @returns {*}
     */
    getEntity() {
        return this._Entity;
    }
}
