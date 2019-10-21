'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config.sequelize);
} else {
  sequelize = new Sequelize(config.sequelize);
  //config.database, config.username, config.password, config
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);

    //?????????????? можно убрать, так как SET
      db[modelName].updateIfNotExists = function(values, options) {
          //console.log(values);
          //console.log(options)
          return new Promise((resolve,reject)=>{
              db[modelName].count({where: [{[Op.and]:[options.where, values]}] })
                  .then(cou=>{
                      if (!cou){
                          db[modelName].update(
                              values,
                              options
                          )
                              .then(ret=>{
                                  resolve(ret);
                              })
                              .catch(e=>reject(e));
                      } else {
                          resolve(false);
                      }
                  })
                  .catch(e=>reject(e));
          });
      };
  }
});

Object.keys(db).forEach(modelName => {
  //console.log(modelName)
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
