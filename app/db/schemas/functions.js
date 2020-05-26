import { query } from '../dbQuery';

const fnUserHasPermission = 'user_has_permission';

/*
 * Function: user_has_permission
 * Checks if user has at least one of the permission codes provided
 * in the array arg
 */
export const createFnUserHasPermission = async () => {

    const stmt = `CREATE OR REPLACE FUNCTION ${fnUserHasPermission} (
            user_id int,
            permission_codes varchar[]
        ) RETURNS boolean as $$
        
        DECLARE does_match BOOLEAN;
        
        BEGIN
            
            SELECT
                COALESCE(p.permission_code = ANY(permission_codes), FALSE) INTO does_match
            FROM users u
                INNER JOIN roles r ON r.id = u.role_id
                LEFT JOIN role_permissions rp ON rp.role_id = r.id
                LEFT JOIN permissions p ON p.id = rp.permission_id
            WHERE u.id = user_id;
            
            RETURN does_match;
        
        END;
        $$ LANGUAGE plpgsql;
    `;
    return query(stmt);
};

/**
 * 
 * @param {int} userId 
 * @param {string[]} permissionsReq 
 */
export const execFnUserHasPermission = async (userId, permissionsReq) => {
    const dbRes = await query(`SELECT ${fnUserHasPermission} ($1, $2)`, [userId, permissionsReq]);
    return dbRes.rows[0][fnUserHasPermission];
}