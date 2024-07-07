const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const { Pool } = require('pg');

// Initialize Redis client
const redisClient = redis.createClient({ host: 'redis' });

redisClient.on('error', (err) => console.error('Redis error: ', err));

// Initialize PostgreSQL client
const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'mydatabase',
  password: 'password',
  port: 5432,
});

const app = express();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
  })
);

app.get('/api/visit', async (req, res) => {
  try {
    const result = await pool.query('SELECT count FROM visit_count WHERE id = 1');
    let count = result.rows[0].count;
    count += 1;
    await pool.query('UPDATE visit_count SET count = $1 WHERE id = 1', [count]);
    res.json({ visitCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
