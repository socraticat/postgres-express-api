import { query, genFnDropQuery } from '../dbQuery';
import { generateRandomPwd, hashPwd } from '../../controllers/auth';

const tableUsers = 'users';
const viewUsers = 'vw_users';

export const names = {
    TABLE_USERS: tableUsers,
    VIEW_USERS: viewUsers
};

/**
 * Create users Table
 */
export const usersTableCreate = async () => {
    const createQuery = `CREATE TABLE IF NOT EXISTS ${tableUsers} (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(150) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        title VARCHAR(50) NOT NULL,
        role_id SERIAL REFERENCES roles(id) ON DELETE RESTRICT,
        created_at TIMESTAMPTZ NOT NULL
    )`;

    return query(createQuery);
};

export const usersViewCreate = async () => {
    const createQuery = `CREATE OR REPLACE VIEW ${viewUsers} AS
        SELECT
            u.id,
            u.email,
            u.first_name,
            u.last_name,
            (u.first_name || ' ' || u.last_name) AS full_name,
            u.title,
            r.title AS role,
            r.description AS role_description,
            u.created_at
        FROM users u
            INNER JOIN roles r ON r.id = u.role_id`;

    return query(createQuery);
};

/**
 * Drop users Table
 */
export const usersTableDrop = genFnDropQuery(tableUsers);

/**
 * 
 * @param {int} id 
 */
export const getUserById = async (id) => {
    try {
        const dbRes = await query(`SELECT * FROM ${viewUsers} WHERE id = $1`, [id]);
        return dbRes.rows[0] || null;
    } catch (err) {
        console.error('GetUserById failed', err);
        return null;
    }
}

/**
 * Gets the user data straight from table
 * @param {int} id
 * @param {boolean?} removePwd - Removes password from retrieved object
 */
export const getUserTblById = async (id, removePwd = false) => {
    try {
        const dbRes = await query(`SELECT * FROM ${tableUsers} WHERE id = $1`, [id]);
        const data = dbRes.rows[0] || null;
        if (removePwd && data && data.password) {
            delete data.password;
        }
        return data;

    } catch (err) {
        console.error('GetUserById failed', err);
        return null;
    }
}

/**
 * 
 * @param {int} email 
 */
export const getUserByEmail = async (email) => {
    try {
        const dbRes = await query(`SELECT * FROM ${viewUsers} WHERE email = $1`, [email]);
        return dbRes.rows[0] || null;
    } catch (err) {
        console.error('GetUserByEmail failed', err);
        return null;
    }
}

/**
 * Gets the user data straight from table
 * @param {int} email
 * @param {boolean?} removePwd - Removes password from retrieved object
 */
export const getUserTblByEmail = async (email, removePwd = false) => {
    try {
        const dbRes = await query(`SELECT * FROM ${tableUsers} WHERE email = $1`, [email]);
        const data = dbRes.rows[0] || null;
        if (removePwd && data && data.password) {
            delete data.password;
        }
        return data;

    } catch (err) {
        console.error('GetUserByEmail failed', err);
        return null;
    }
}

/**
 * 
 * @param {int} id 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} title 
 */
export const updateUserProfile = async (id, firstName, lastName, title) => {

    const queryUpdate = `UPDATE users
        SET first_name = $2, last_name = $3, title = $4
        WHERE id = $1
        RETURNING first_name, last_name, title`;

    const values = [id, firstName, lastName, title];

    try {
        const dbRes = await query(queryUpdate, values);
        const data = dbRes.rows[0];
        return data;

    } catch (err) {
        throw new Error(err);
    }
}

/**
 * Changes a user's password to a new or randomized string
 * @param {int} id 
 * @param {string?} newPasswordOrRandom - If null, a randomized string will be used
 */
export const setUserPassword = async (id, newPasswordOrRandom = null) => {
    let newPass = newPasswordOrRandom;
    if (!newPasswordOrRandom) {
        newPass = generateRandomPwd(10);
    }
    const hashedPassword = await hashPwd(newPass);

    try {
        const dbResult = await query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, id]);
        if (!newPasswordOrRandom) {
            return newPass;
        }
        return null;
    } catch (err) {
        console.error(err.detail || err);
        throw new Error(err);
    }
}

/**
 * 
 * @param {string} email 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {string} title 
 * @param {int} roleId
 * @returns {{ {}, tempPwd }}
 */
export const createNewUser = async (email, firstName, lastName, title, roleId) => {

    const queryCreate = `INSERT INTO users
        (email, first_name, last_name, password, title, role_id, created_at) VALUES
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`;

    const currentTime = new Date();
    const tempPwd = generateRandomPwd(10);
    const hashedPassword = await hashPwd(tempPwd);

    const values = [
        email,
        firstName,
        lastName,
        hashedPassword,
        title,
        roleId,
        currentTime
    ];

    const dbRes = await query(queryCreate, values);
    return { newUser: dbRes.rows[0], tempPwd };
};