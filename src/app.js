'use strict';

const express = require('express');
const config = require('./config');
const { checkConnection } = require('./db');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'neighbourhood-market-hub' });
});

app.get('/health/db', async (req, res, next) => {
  try {
    const ok = await checkConnection();
    res.status(200).json({ status: 'ok', database: ok ? 'connected' : 'unknown' });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(`Request failed: ${error.message}`);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error.' } });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Backend listening on port ${config.port}`);
  });
}

module.exports = app;
