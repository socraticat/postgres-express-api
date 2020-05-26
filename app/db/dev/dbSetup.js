import pool from '../pool';
import {
    usersTableCreate,
    usersViewCreate,
    usersTableDrop
} from '../schemas/users';
import { query } from '../dbQuery';
import {
    rolesTableCreate,
    permissionsTableCreate,
    rolePermissionsTableCreate,
    userAccessViewCreate,
    rolesTableDrop,
    permissionsTableDrop,
    rolePermissionsTableDrop
} from '../schemas/role_permissions';
import {
    createFnUserHasPermission
} from '../schemas/functions';

pool.on('connect', () => {
    console.log('Connected to Postgres DB');
});

pool.on('remove', () => {
    console.log('Client removed. Exiting process..');
    process.exit(0);
});

const initRoutine = async () => {
    try {
        const client = await pool.connect();

        let success = await createAll();
        success = await initData();

        console.log(success ? 'All tables initialized' : 'DB init failed');
        client.release();
    } catch (err) {
        console.error(err);
    }
};

/**
 * Create All Tables
 * Order MATTERS
 */
const createAll = async () => {
    // Role-Permissions first
    console.log('Creating tables: roles, permissions...');
    await rolesTableCreate();
    await permissionsTableCreate();
    await rolePermissionsTableCreate();
    // User, references Role
    console.log('Creating table: users...');
    await usersTableCreate();

    // VIEWS
    console.log('Creating view: users...');
    await usersViewCreate();
    console.log('Creating view: user permissions...');
    await userAccessViewCreate();

    // FUNCTIONS
    console.log('Creating function: user_has_permission...');
    await createFnUserHasPermission();

    return true;
};

const initData = async () => {
    const qRole = await query(
        `INSERT INTO roles (title, description, created_on)
            VALUES
                ('Tech Admin', 'High-level technical/IT administrator.', NOW()),
                ('Employee', 'Generic low-level employee.', NOW())`
    );
    const qPerm = await query(
        `INSERT INTO permissions (permission_code, descriptor, description, created_on)
            VALUES
                ('MASTER', 'All Access', 'Grants access to all features', NOW()),
                ('USER_MGMT', 'Manage Users', 'Grants ability to manage users on the platform', NOW()),
                ('USER_VIEW', 'View Users', 'Grants access to user information on the platform', NOW())`
    );
    const qRolePermLink = await query(
        `INSERT INTO role_permissions VALUES (1, 1), (2, 3);`
    );
    const qUser = await query(
        `INSERT INTO users (email, first_name, last_name, title, role_id, created_at)
            VALUES
                ('prayogo.ken@gmail.com', 'Ken', 'Prayogo', 'System Admin', 1, NOW())`
    );

    return true;
};

/**
 * Drop All Tables
 * Order MATTERS
 */
const dropAll = async () => {
    await usersTableDrop();
    await rolePermissionsTableDrop();
    await rolesTableDrop();
    await permissionsTableDrop();
    return true;
};

export {
    initRoutine,
    dropAll,
};