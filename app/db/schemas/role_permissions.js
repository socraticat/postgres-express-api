import { query, genFnDropQuery } from '../dbQuery';

const tableRoles = 'roles';
const tablePermissions = 'permissions';
const tableLink = 'role_permissions';
const viewUserAccess = 'vw_user_access';

export const rolesTableCreate = async () => {
    const createQuery = `CREATE TABLE IF NOT EXISTS ${tableRoles} (
        id SERIAL PRIMARY KEY,
        title VARCHAR(50) UNIQUE NOT NULL,
        description VARCHAR(250) NOT NULL,
        created_on DATE NOT NULL
    )`;

    return query(createQuery);
};

export const permissionsTableCreate = async () => {
    const createQuery = `CREATE TABLE IF NOT EXISTS ${tablePermissions} (
        id SERIAL PRIMARY KEY,
        permission_code VARCHAR(50) UNIQUE NOT NULL,
        descriptor VARCHAR(100) NOT NULL,
        description VARCHAR(250) NOT NULL,
        created_on DATE NOT NULL
    )`;

    return query(createQuery);
};

export const rolePermissionsTableCreate = async () => {
    const createQuery = `CREATE TABLE IF NOT EXISTS ${tableLink} (
        role_id SERIAL REFERENCES ${tableRoles}(id) ON DELETE CASCADE,
        permission_id SERIAL REFERENCES ${tablePermissions}(id) ON DELETE CASCADE
    )`;

    return query(createQuery);
};

export const userAccessViewCreate = async () => {
    const createQuery = `CREATE OR REPLACE VIEW ${viewUserAccess} AS
        SELECT
            u.id AS user_id,
            r.id AS role_id,
            r.title AS title,
            ARRAY_AGG(p.id) AS permission_ids,
            ARRAY_AGG(p.permission_code) AS permission_codes
        FROM users u
            INNER JOIN roles r ON r.id = u.role_id
            JOIN role_permissions rp ON rp.role_id = r.id
            JOIN permissions p ON p.id = rp.permission_id
        GROUP BY u.id, r.id`;

    return query(createQuery);
};

// @TODO: permission_sets to store 1-many permissions (e.g. VIEW_ALL = join VIEW_PRD, VIEW_MKT, etc)

export const rolesTableDrop = genFnDropQuery(tableRoles);
export const permissionsTableDrop = genFnDropQuery(tablePermissions);
export const rolePermissionsTableDrop = genFnDropQuery(tableLink);
