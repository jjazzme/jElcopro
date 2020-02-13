import Sequelize from 'sequelize';

export default function DatabaseConnection(config, logger, namespace) {
    const logging = (...args) => {
        logger.debug({}, args[0]);
    };
    Sequelize.useCLS(namespace);
    return new Sequelize({ logging, ...config.db });
}
