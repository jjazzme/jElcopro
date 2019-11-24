import Sequelize from 'sequelize';
import _ from 'lodash';

export default class BaseModel extends Sequelize.Model {
    static init(definition, services) {
        const sequelize = services.db.connection;

        this.$relations = definition.relations || {};

        this.services = services;
        this.prototype.services = services;

        return super.init(definition.attributes, {
            ...definition.options,
            sequelize,
        });
    }

    static associate() {
        const toRelName = (string) => {
            const name = _.kebabCase(string);

            return name.charAt(0).toUpperCase() + name.slice(1);
        };

        if (typeof this.$relations !== 'object' || this.$relations === null) {
            return;
        }

        Object.keys(this.$relations).forEach((relationshipType) => {
            const relationshipDefinitions = this.$relations[relationshipType];

            Object.keys(relationshipDefinitions).forEach((relationshipTarget) => {
                let relationshipTargetDefinitions = relationshipDefinitions[relationshipTarget];

                if (!Array.isArray(relationshipTargetDefinitions)) {
                    relationshipTargetDefinitions = [relationshipTargetDefinitions];
                }

                relationshipTargetDefinitions.forEach((relationshipDefinition) => {
                    const relationshipName = toRelName(relationshipDefinition.as || relationshipTarget);
                    const targetModel = this.sequelize.models[relationshipTarget];

                    this[relationshipName] = this[relationshipType](targetModel, relationshipDefinition);
                });
            });
        });
    }

    static registerHooks() {
        return this;
    }

    /**
     * Get instance by id, alias or same
     * @param {BaseModel|Object|number|string} instance
     * @param args
     * @returns {Promise<BaseModel|null>}
     */
    static async getInstance(instance, ...args) {
        let answer = null;
        const scopes = _.flattenDeep(args);
        if (typeof instance === 'number') {
            answer = await this.scope(scopes).findByPk(instance);
        } else if (typeof instance === 'string' && this.getByAlias) {
            answer = await this.getByAlias(instance, scopes);
        } else if (instance instanceof this) {
            const deep = scopes.reduce((prev, value) => prev && instance.get(value) !== undefined, true);
            if (deep) {
                answer = instance;
            } else {
                answer = await this.scope(scopes).findByPk(instance.id);
            }
        } else if (_.isPlainObject(instance)) {
            answer = await this.scope(scopes).findOne({ where: instance });
        }
        return answer;
    }

    static async getInstanceOrCreate(instance, ...args) {
        const scopes = _.flattenDeep(args).filter((v) => _.isString(v));
        const additional = _.find(args, (o) => _.isPlainObject(o)) || {};
        let answer = await this.getInstance(instance, scopes);
        if (!answer) {
            answer = await this.create(Object.assign(additional, instance));
            if (!_.empty(scopes)) answer = await this.getInstance(answer, scopes);
        }
        return answer;
    }

    // Тут возможно придется иправлять логику со скопами
    static async updateInstanceOrCreate(instance, ...args) {
        const scopes = _.flattenDeep(args).filter((v) => _.isString(v));
        const additional = _.find(args, (o) => _.isPlainObject(o)) || {};
        let answer = await this.getInstance(instance, scopes);
        if (answer) {
            await answer.update(additional);
        } else {
            answer = this.create(Object.assign(additional, instance));
        }
        if (!_.isEmpty(scopes)) answer = await this.getInstance(answer, scopes);
        return answer;
    }

    /**
     * Find right instance
     * @param {BaseModel|Object|number|string} instance
     * @param args
     * @returns {Promise<BaseModel|null>}
     */
    static async getRightInstance(instance, ...args) {
        let rightInstance = await this.getInstance(instance, args);
        const right = _.find(Object.keys(this.rawAttributes), (o) => o.indexOf('right_') === 0);
        if (right && rightInstance && rightInstance.get(right)) {
            rightInstance = await this.getInstance(rightInstance.get(right), args);
        }
        return rightInstance;
    }

    static async getRightInstanceOrCreate(instance, ...args) {
        const scopes = _.flattenDeep(args).filter((v) => _.isString(v));
        const additional = _.find(args, (o) => _.isPlainObject(o)) || {};
        let rightInstance = await this.getRightInstance(instance, scopes);
        if (!rightInstance) {
            rightInstance = await this.create(Object.assign(additional, instance));
            if (!_.isEmpty(scopes)) rightInstance = await this.getInstance(rightInstance, scopes);
        }
        return rightInstance;
    }

    /**
     * Return Only Values object
     * @returns {*}
     */
    getPlain() {
        return this.get({ plain: true });
    }
}
