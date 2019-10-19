import db from '../models/index';

export default class Entity {
    /**
     * Constructor
     * @param Entity
     */
    constructor(Entity) {
        this._Entity = Entity
    }

    /**
     * Find by id or attributes in newItem
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
     * Update or Create with triggers before & after
     * @param newItem
     * @returns {Promise<*>}
     */
    async updateOrCreate(newItem) {
        let item = undefined;
        const t = await db.sequelize.transaction();
        try {
            item = await this.find(newItem);
            if (!item) {
                item = this._Entity.build(newItem);
            } else {
                item.set(newItem);
            }
            if (this.before) {
                await this.before(item, t);
            }
            await item.save({ transaction: t });
            if (this.after) {
                await this.after(item, t);
            }
            await t.commit();
        } catch (e) {
            await t.rollback();
            throw e
        }
        return item;
    }
}