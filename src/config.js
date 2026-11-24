'use strict';

const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill in local values.`
  );
}

function validPort(value, name, fallback) {
  const port = Number(value || fallback);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }
  return port;
}

module.exports = {
  port: validPort(process.env.PORT, 'PORT', 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST,
    port: validPort(process.env.DB_PORT, 'DB_PORT', 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
