import fs from 'fs';

const path = './commands/';

module.exports.run = async () => {
    await fs.readdir(path, async (err, files) => {
        // eslint-disable-next-line global-require,import/no-dynamic-require
        const promises = files.filter((file) => file.indexOf('seed') === 0).map((file) => require(`./${file}`).run());
        await Promise.all(promises);
    });
    console.log('All seed');
};