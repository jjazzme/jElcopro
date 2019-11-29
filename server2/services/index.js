import { createNamespace } from 'cls-hooked';
import uuid4 from 'uuid/v4';
import pino from 'pino';
import http from 'http';
import EventEmitter from 'events';
import Container from './Container';
import config from '../config';
import ExpressService from './ExpressService';
import DatabaseConnection from './DatabaseConnection';
import DatabaseService from './DatabaseService';
import CacheService from './CacheService';
import DadataSerice from './DadataSerice';
import CompelService from './CompelService';
import PromelecService from './PromelecService';
import PriceService from './PriceService';
import TransitionService from './TransitionService';
import AuthService from './AuthService';

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
    container.register('dbConnection', DatabaseConnection, ['config', 'logger', 'namespace']);
    container.register('db', DatabaseService, ['dbConnection']);
    container.register('cache', CacheService, ['logger']);
    container.register('dadata', DadataSerice, ['config', 'cache', 'logger']);
    container.register('compel', CompelService, ['config', 'db', 'logger', 'cache']);
    container.register('promelec', PromelecService, ['config', 'db', 'logger', 'cache']);
    container.register('prices', PriceService, ['db']);
    container.register('transition', TransitionService, ['db']);
    container.register('auth', AuthService, ['express', 'db']);
    return container;
};