'use strict';
import { ParameterName, Unit } from '../models';

module.exports.run = async () => {
    let m = Unit.findOne({ where: { alias: 'm' } });
    const names = [
        { where: { alias: 'height' }, defaults: { name: 'высота', type: 1, 'base_unit_id': m.id } },
        { where: { alias: 'case' }, defaults: { name: 'корпус', type: 0 } }
    ];
    names.forEach(value => ParameterName.findOrCreate(value));
};