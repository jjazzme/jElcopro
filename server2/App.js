export default class App {
    constructor(services) {
        this.services = services;
    }

    start() {
        const { db, express } = this.services;

        express.set('services', this.services);

        if (!db.models) {
            db.loadModels(this.services);
        }

        // configure top-level express middleware, e.g. bodyParser, cors etc

        express.use(async (request, response, next) => {
            const { events } = this.services;

            events.emit('boot', this.services);

            // boot any services, e.g. establish database connection,
            // read request headers to initialize the session etc.

            events.emit('ready', this.services);

            // not in the scope of this example,
            // but there is a similar event emitted from the
            // last express middleware we use to wrap our route response
            // into an API response
            events.emit('request', request);

            next();
        });

        // register express routes
        // register error/response handling middleware

        process.on('unhandledRejection', (err) => {
            const { logger } = this.services;

            logger.error(err);
        });

        return express;
    }

    serve() {
        const {
            express,
            config,
            http,
            logger,
        } = this.services;

        const port = config.port || 3000;
        const hostname = config.hostname || 'localhost';

        express.set('port', port);
        express.set('hostname', hostname);

        const server = http.createServer(express);

        server.listen({
            port,
            host: hostname,
        });

        // eslint-disable-next-line no-unused-vars
        server.on('error', (err) => {
            // handle your errors
        });

        logger.info({}, 'Server start');

        return this;
    }

    async migrate() {
        const { db } = this.services;
        await db.sync({ alter: true });
    }
}
