import listEndPoints from 'express-list-endpoints';
import createError from 'http-errors';
import apiRoutes from './router/apiRoutes';

export default class App {
    constructor(services) {
        this.services = services;
    }

    start() {
        const { db, express, auth } = this.services;

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

        auth.init();

        // register express routes
        // API
        express.use('/api', apiRoutes(db, auth));

        // catch 404 and forward to error handler
        express.use((req, res, next) => {
            next(createError(404));
        });

        // error handler
        // eslint-disable-next-line no-unused-vars
        express.use((err, req, res, next) => {
            // set locals, only providing error in development
            // res.locals.message = err.message;
            // res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500).send({ name: err.name, message: err.message });
            // res.render('error');
        });

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

        logger.debug(listEndPoints(express), 'Routes');

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
