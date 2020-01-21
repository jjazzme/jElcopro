import _ from 'lodash';

const localCache = new Map();

export const getXlsxData = (z, worksheet) => {
    let stop = 0;
    for (let i = 0; i < z.length; i += 1) {
        if (!Number.isNaN(Number.parseInt(z[i], 0))) {
            stop = i;
            break;
        }
    }
    return {
        col: z.substring(0, stop),
        row: parseInt(z.substring(stop), 0),
        value: worksheet[z].v,
    };
};

export const cacheable = (target, key, descriptor) => {
    const { value } = descriptor;
    descriptor.value = async function (...args) {
        const currentCache = this.cache || this.services?.cache || localCache;
        const modifyArgs = args.map((val) => {
            if (typeof val === 'object') return JSON.stringify(val);
            return val.toString();
        });
        const currentKey = key + _.join(modifyArgs);
        if (await currentCache.has(currentKey)) return currentCache.get(currentKey);
        const response = await value.call(this, ...args);
        if (currentCache.set) currentCache.set(currentKey, response);
        else currentCache.put(currentKey, response, 900);
        return response;
    };
};

export const logable = (target, key, descriptor) => {
    const { value } = descriptor;
    descriptor.value = async function (...args) {
        const logger = this.logger || this.services?.logger || console;
        logger.info(args, `Call ${key} in ${target.constructor.name}`);
        return value.call(this, ...args);
    };
};
