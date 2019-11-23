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
     * @param {BaseModel|Object|number} instance
     * @param {Array=} scopes
     * @returns {Promise<BaseModel|null>}
     */
    static async getModel(instance, scopes = []) {
        let answer = null;
        if (typeof instance === 'number') {
            answer = await this.scope(scopes).findByPk(instance);
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
}
