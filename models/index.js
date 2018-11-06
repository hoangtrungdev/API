const Sequelize  = require("sequelize");
const sequelize = new Sequelize('TrungTest', 'root', '12345678', {
  host: 'localhost',
  dialect: 'mysql',
  define: {
    timestamps: false
  },
  logging: false,
  freezeTableName: true,
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});


/**
 * sequelize-auto -o "./models/mysql" -d TrungTest -h localhost -u root -p 3306  -x 12345678 -e mysql
 * sequelize-auto -o "./models/mysql" -d TrungTest -h localhost -u root -p 3306  -x 12345678 -e mysql -t test
 * */

/* loading the models */
const fs = require("fs");
const path = require("path");

const _dirDefine = path.join(__dirname, 'mysql/');
fs.readdirSync(_dirDefine).forEach(function(filename) {
  let model = sequelize.import(path.join(_dirDefine, filename));
  sequelize[model.name] = model;
});



module.exports = sequelize;