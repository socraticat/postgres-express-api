import {
    userHasPermission
} from '../controllers/userPermissionsCtrl';
import { errorMessage, statusCodes } from '../helpers/status';

/**
 * Base logic. Override in other fns with specific access codes
 * @param {*} req
 * @param {*} res
 * @param {function} next
 */
const verifyAccess = async (req, res, next, codes) => {
    if (!req.user) {
        errorMessage.error = 'No user object in request';
        return res.status(statusCodes.UNAUTHORIZED).send(errorMessage);
    }
    const allow = await userHasPermission(req.user.id, codes);

    if (allow) {
        next();
    }
    else {
        errorMessage.message = 'Access denied. You are not authorized to perform this operation.';
        res.status(statusCodes.UNAUTHORIZED).send(errorMessage);
    }
};

/**
 * Verifies access permissions for User edit
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const verifyAccessUserEdit = async (req, res, next) => {
    // @TODO: Access logic in DB?
    const codes = ['MASTER', 'USER_MGMT'];
    return verifyAccess(req, res, next, codes);
};

/**
 * Verifies access permissions for User edit
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export const verifyAccessUserView = async (req, res, next) => {
    const codes = ['MASTER', 'USER_MGMT', 'USER_VIEW'];
    return verifyAccess(req, res, next, codes);
};