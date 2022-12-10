// // MARKED FOR DELETION
// import knex from 'knex';
// // import { Connection, Request } from 'tedious';

// const db = knex({
//   client: 'mssql',
//   connection: {
//     server: 'dddbdevelopment.database.windows.net',
//     user: 'deaddropadmin',
//     password: '1qa@WS3ed$RF5tg',
//     database: 'DeadDropDBDevelopment',
//   },
// });

// interface User {
//   id: string;
//   username: string;
//   firstName?: string;
//   lastName?: string;
//   isActive: boolean;
// }

// // raw string
// const getUser = db('user').insert({ username: 'b' }).returning('*').toString();
// console.log('getUser', getUser);

// const migrateUser = db.schema
//   .createTable('users', function (table) {
//     table.increments('id');
//     table.string('first_name', 255).notNullable();
//     table.string('last_name', 255).notNullable();
//   })
//   .toString();

// console.log('migrateUser: ', migrateUser);

// // Create connection to database
// const config = {
//   authentication: {
//     options: {
//       userName: 'deaddropadmin', // update me
//       password: '1qa@WS3ed$RF5tg', // update me
//     },
//     type: 'default',
//   },
//   server: 'dddbdevelopment.database.windows.net', // update me
//   options: {
//     database: 'DeadDropDBDevelopment', //update me
//     encrypt: true,
//   },
// };

// function createTable(): void {
//   const sql = `CREATE TABLE users (c1 int UNIQUE) `;
//   const request = new Request(sql, (err) => {
//     if (err) {
//       console.log('Could not create table:  error occured!');
//       throw err;
//     }

//     console.log(`user table created!`);

//     // createTransaction();
//   });

//   connection.execSql(request);
// }

// const connection = new Connection(config);

// // Attempt to connect and execute queries if connection goes through
// connection.on('connect', (err) => {
//   if (err) {
//     console.log('Could not connect');
//     console.error(err.message);
//   } else {
//     console.log('connection sucess');
//     createTable();

//     // queryDatabase();
//   }
//   //   connection.close();
// });

// connection.connect();

// function queryDatabase() {
//   console.log('Reading rows from the Table...');

//   const request = new Request(
//     // `SELECT TOP 20 pc.Name as CategoryName,
//     //                p.name as ProductName
//     //  FROM [SalesLT].[ProductCategory] pc
//     //  JOIN [SalesLT].[Product] p ON pc.productcategoryid = p.productcategoryid`,
//     migrateUser,
//     (err, rowCount) => {
//       if (err) {
//         console.error(err.message);
//       } else {
//         console.log(`${rowCount} row(s) returned`);
//       }
//     },
//   );

//   //   request.on('row', (columns) => {
//   //     columns.forEach((column) => {
//   //       console.log('%s\t%s', column.metadata.colName, column.value);
//   //     });
//   //   });

//   connection.execSql(request);
// }
