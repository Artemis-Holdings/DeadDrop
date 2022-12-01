// Update with your config settings.
// require("dotenv").config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "pg",
    // TODO: rewrite to use environment variables instead of static strings.
    // connection: process.env.CONNECTION_STRING,
    // connection: "postgres://postgres:docker@dead_drop_db:5432/deaddrop",
    connection: "postgres://postgres:docker@localhost:5432/deaddrop",
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
  // TODO: for production, use RDS or other managed DB
  // production: {
  //   client: 'pg',
  //   connection: process.env.DATABASE_URL,
  //   charset: 'utf8',  
  //   migrations: {
  //     directory: './migrations',
  //   }
  // }
};
