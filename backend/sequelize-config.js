const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    database: 'FitLifeProDB',
    username: 'FitLifeProUser',
    password: '2604',
    host: '127.0.0.1',
    dialect: 'postgres',
});
module.exports = sequelize;
//# sourceMappingURL=sequelize-config.js.map