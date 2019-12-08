import fs from 'fs';

const seed = async () => {
    await fs.readdir(__dirname, async (err, files) => {
        const promises = files
            .filter((file) => file.indexOf('seedTestUser') === 0)
            // eslint-disable-next-line global-require,import/no-dynamic-require
            .map((file) => require(`./${file}`).run());
        await Promise.all(promises);
    });
};
seed();
