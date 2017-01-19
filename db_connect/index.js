const promise = require('bluebird');
const options = { promiseLib: promise };
const pgp = require('pg-promise')(options);

const connectionString = 'postgres://postgres:zelda@localhost:5432/catalyst_db';
const db = pgp(connectionString);


module.exports = db;
