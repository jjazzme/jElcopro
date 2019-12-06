import Express from 'express';
import path from 'path';
import expressPino from 'express-pino-logger';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

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
    // express.use('/test', router(Express));
    return express;
}
