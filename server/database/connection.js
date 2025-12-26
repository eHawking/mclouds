const mariadb = require('mariadb');

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Missing database environment variables: ${missingVars.join(', ')}`);
  console.warn('   Using default values - this may cause connection issues in production.');
}

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'magnetic_clouds',
  connectionLimit: 10,
  acquireTimeout: 30000,
  connectTimeout: 30000
});

async function query(sql, params) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(sql, params);
    return result;
  } catch (error) {
    // Add more context to database errors
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ Database access denied. Check DB_USER and DB_PASSWORD in .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ Database does not exist. Run migrations first: node server/database/migrate.js');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to database server. Check DB_HOST and DB_PORT.');
    }
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function transaction(callback) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  transaction
};
