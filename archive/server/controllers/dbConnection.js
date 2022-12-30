// const dbConnection = require("knex")(
//   require("../knexfile")[process.env.NODE_ENV || "development"]
// );
// module.exports = dbConnection;

const knex = require('knex');
const knexConfig = require('../knexfile');
const environment = process.env.DB_ENV || 'development';
module.exports = knex(knexConfig[environment]);

// const knex = require("knex");

// const knexConfigs = require("../knexfile");

// const currentConfig = knexConfigs[process.env.NODE_ENV || "development"];

// const dbConnection = knex(currentConfig);

// module.exports = dbConnection;
