#!/usr/bin/env babel-node
import app from './index';

const { logger } = app.services;
app.migrate().then(() => {
    logger.info({}, 'Migrate successful');
});
