import { expect } from 'chai';
import app from '../index';

describe('Test CacheService', () => {
    const { cache } = app.services;

    it('Test plain value', async () => {
        expect(await cache.has('TestApp'), 'No TestApp key in cache').to.equal(false);
        expect(await cache.put('TestApp', 'I1234567890'), 'Cache put 1234567890').to.equal('I1234567890');
        expect(await cache.get('TestApp'), 'Cache get I1234567890').to.equal('I1234567890');
        expect(await cache.forget('TestApp'), 'Cache forget').to.equal(true);
        expect(await cache.get('TestApp'), 'Cache is empty').to.equal(null);
    });
    it('Test object value', async () => {
        const value = { a: 1, b: { c: true, d: null } };
        expect(await cache.put('TestApp', value), 'Cache put value').to.equal(value);
        expect(await cache.get('TestApp'), 'Cache get value').to.deep.include(value);
        expect(await cache.forget('TestApp'), 'Cache forget').to.equal(true);
        expect(await cache.get('TestApp'), 'Cache is empty').to.equal(null);
    });
});
