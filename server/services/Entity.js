import db from '../models/index';

export default class Entity {
    /**
     *
     * @param Entity
     */
    constructor(Entity) {
        this._Entity = Entity
    }

    /**
     *
     * @param newItem
     * @returns {Promise<*>}
     */
    async find(newItem) {
        let item = undefined;
        if (newItem.id) {
            item = await this._Entity.findOne({ where : { id: newItem.id } });
        } else {
            item = await this._Entity.findOne({ where : newItem });
        }
        return item;
    }

    /**
     *
     * @param newItem
     * @param triggers
     * @returns {Promise<*>}
     */
    async updateOrCreate(newItem, triggers) {
        let item = undefined;
        const t = await db.sequelize.transaction();
        try {
            item = await this.find(newItem);
            if (!item) {
                item = this._Entity.build(newItem);
            } else {
                item.set(newItem);
            }
            if (triggers && triggers.before) {
                await triggers.before(item, t);
            }
            await item.save({ transaction: t });
            if (triggers && triggers.after) {
                await triggers.after(item, t);
            }
            await t.commit();
        } catch (e) {
            await t.rollback();
            throw e
        }
        return item;
    }
}