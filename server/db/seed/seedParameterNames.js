import app from '../../index';

const { ParameterName, Unit } = app.services.db.models;

module.exports.run = async () => {
    const m = Unit.findOne({ where: { alias: 'm' } });
    const names = [
        { where: { alias: 'height' }, defaults: { name: 'высота', type: 1, base_unit_id: m.id } },
        { where: { alias: 'case' }, defaults: { name: 'корпус', type: 0 } },
    ];
    names.forEach((value) => ParameterName.findOrCreate(value));
};
