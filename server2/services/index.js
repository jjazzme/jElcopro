import { createNamespace } from 'cls-hooked';
import uuid4 from 'uuid/v4';
import pino from 'pino';
import http from 'http';
import EventEmitter from 'events';
import Container from './Container';
import config from '../config';
import ExpressService from './ExpressService';

export default () => {
    const namespace = createNamespace(uuid4());
    const container = new Container(namespace);
    const level = process.env.JB_DEBUG_FILE ? 'debug' : 'info';
    const logger = pino({ level, prettyPrint: true });
    // Register services
    container.register('namespace', () => namespace);
    container.register('config', () => config);
    container.register('logger', () => logger);
    container.register('http', () => http);
    container.register('events', EventEmitter);
    container.register('express', ExpressService, ['namespace', 'logger']);

    return container;
};
