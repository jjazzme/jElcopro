import fs from 'fs';
import models from "../models"

const path = './commands/';

module.exports.run = () => {
    const sequelize = models.sequelize;
    sequelize.sync({alter:true}).then(res => {
        console.log('Nice! Database looks fine');

        const seed = async() =>{
            await fs.readdir(path, async (err, files) => {
                // eslint-disable-next-line global-require,import/no-dynamic-require
                const promises = files.filter((file) => file.indexOf('seed') === 0).map((file) => require(`./${file}`).run());
                await Promise.all(promises);
            });
            console.log('All seed');

        };

        seed();
    }).catch(err => {
        console.log(err, "Something went wrong with the Database Update!")
    });
};