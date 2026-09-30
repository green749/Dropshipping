import { Sequelize } from 'sequelize';
import pg from 'pg';
import { env } from './env.js';

const isTest = env.NODE_ENV === 'test';
const instances = new Map();
let currentActiveDb = env.DB.NAME;

export const setServiceDatabase = (dbName) => {
  if (dbName) {
    currentActiveDb = dbName;
  }
};

export const ensureDatabaseExists = async (targetDbName) => {
  if (isTest || !targetDbName) return;

  const client = new pg.Client({
    host: env.DB.HOST,
    port: env.DB.PORT,
    user: env.DB.USER,
    password: env.DB.PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDbName]
    );

    if (res.rowCount === 0) {
      console.log(`Database '${targetDbName}' does not exist. Creating database automatically...`);
      await client.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`Database '${targetDbName}' created successfully.`);
    }
  } catch (err) {
    console.error(`Database auto-creation check failed for '${targetDbName}':`, err.message);
  } finally {
    await client.end();
  }
};

export const getSequelize = (dbName = currentActiveDb) => {
  if (isTest) {
    if (!instances.has('test')) {
      instances.set('test', new Sequelize('sqlite::memory:', {
        logging: false,
        define: {
          timestamps: true,
          underscored: true,
        },
      }));
    }
    return instances.get('test');
  }

  const targetName = dbName || env.DB.NAME;
  if (!instances.has(targetName)) {
    const instance = new Sequelize(targetName, env.DB.USER, env.DB.PASSWORD, {
      host: env.DB.HOST,
      port: env.DB.PORT,
      dialect: 'postgres',
      logging: env.DB.LOGGING,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
      },
    });
    instances.set(targetName, instance);
  }

  return instances.get(targetName);
};

export const sequelize = new Proxy({}, {
  get(target, prop) {
    const instance = getSequelize(currentActiveDb);
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export const connectDB = async (dbNameOrCallback, initModelsCallback) => {
  let targetDbName = env.DB.NAME;
  let callback = initModelsCallback;

  if (typeof dbNameOrCallback === 'string') {
    targetDbName = dbNameOrCallback;
  } else if (typeof dbNameOrCallback === 'function') {
    callback = dbNameOrCallback;
  }

  setServiceDatabase(targetDbName);
  const activeSequelize = getSequelize(targetDbName);

  try {
    await ensureDatabaseExists(targetDbName);
    await activeSequelize.authenticate();
    console.log(`PostgreSQL Database connection ('${targetDbName}') established successfully.`);
    
    if (callback) {
      await callback(activeSequelize);
    }

    try {
      await activeSequelize.sync();
      console.log(`PostgreSQL database '${targetDbName}' models synchronized successfully.`);
    } catch (syncErr) {
      console.warn(`PostgreSQL database sync warning for '${targetDbName}':`, syncErr.message);
    }
  } catch (error) {
    console.error(`Unable to connect to PostgreSQL database '${targetDbName}':`, error.message);
    throw error;
  }
};
