// Update with your config settings.
require("dotenv").config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "pg",
    // connection: process.env.CONNECTION_STRING,
    connection: "postgres://postgres:docker@dead_drop_db:5432/deaddrop",
    // migrations: {
    //   directory: './migrations',
    // }
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    charset: 'utf8',  
    migrations: {
      directory: './migrations',
    }
  }
};
