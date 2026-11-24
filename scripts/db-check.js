'use strict';

const { checkConnection, closePool } = require('../src/db');

checkConnection()
  .then((ok) => {
    console.log(ok ? 'Database connection: ok' : 'Database connection: unexpected response');
    process.exitCode = ok ? 0 : 1;
  })
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await closePool();
    } catch (error) {
      console.error(`Pool shutdown failed: ${error.message}`);
    }
  });
