'use strict';

const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

async function checkConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT 1 AS ok');
    return result.rows[0].ok === 1;
  } finally {
    client.release();
  }
}

async function closePool() {
  await pool.end();
}

module.exports = { pool, checkConnection, closePool };
