import { Pool } from 'pg';

// @TODO: Remove after dev
require('dotenv').config();

const {
    PGHOST,
    PGUSER,
    PGPASSWORD,
    PGDATABASE,
    PGPORT
} = process.env;

const dbConfig = {
    host: PGHOST,
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE,
    port: PGPORT,
};

const pool = new Pool(dbConfig);

export default pool;