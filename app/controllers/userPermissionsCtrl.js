import { query } from '../db/dbQuery';
import { execFnUserHasPermission } from '../db/schemas/functions';
// import {
//     errorMessage, successMessage, statusCodes,
// } from '../helpers/status';

/**
 * 
 * @param {int} userId
 * @returns {array} 
 */
export const getUserPermissions = async (userId) => {
    const dbRes = await query(`SELECT * FROM vw_user_access WHERE user_id = ${userId}`);
    return dbRes.rows[0].permission_codes;
};

/**
 * 
 * @param {int} userId 
 * @param {string[]} permissionsReq 
 */
export const userHasPermission = async (userId, permissionsReq) => {
    return execFnUserHasPermission(userId, permissionsReq);
};