import pool from './pool';

/**
 * DB Query
 * @param {string} queryText
 * @param {array} params
 * @returns {object}
 */
export const query = async (queryText, params = []) => {
    return pool.query(queryText, params);
};

/**
 * Generates a drop query async function
 * @param {*} tableName 
 */
export const genFnDropQuery = (tableName) => {
    return async () => {
        return query(`DROP TABLE IF EXISTS ${tableName}`);
    };
};