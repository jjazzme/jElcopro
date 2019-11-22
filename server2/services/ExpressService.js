import Express from 'express';
import path from 'path';
import expressPino from 'express-pino-logger';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import createError from 'http-errors';
import router from '../router';

export default function ExpressService(namespace, logger) {
    const express = new Express();

    express.use((req, res, next) => {
        namespace.bindEmitter(req);
        namespace.bindEmitter(res);

        namespace.run(() => {
            next();
        });
    });
    express.use(expressPino({ logger }));
    express.set('views', path.join(__dirname, '../views'));
    express.set('view engine', 'pug');
    express.use(Express.json());
    express.use(Express.urlencoded({ extended: false }));
    express.use(cookieParser());
    express.use(Express.static(path.join(__dirname, 'public')));
    express.use(bodyParser.urlencoded({ extended: true }));
    express.use(bodyParser.json());
    express.use('/', router(Express));
    // catch 404 and forward to error handler
    express.use((req, res, next) => {
        next(createError(404));
    });
    // error handler
    // eslint-disable-next-line no-unused-vars
    express.use((err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
    return express;
}
