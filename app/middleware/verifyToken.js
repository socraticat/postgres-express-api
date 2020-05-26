import { verifyJwtToken } from '../controllers/auth';
import { errorMessage, statusCodes } from '../helpers/status';

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {function} next
 */
const verifyToken = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        errorMessage.error = 'Token not provided';
        return res.status(statusCodes.BAD).send(errorMessage);
    }
    const token = authorization.split(' ')[1];
    if (!token) {
        errorMessage.error = 'Malformed login token';
        return res.status(statusCodes.BAD).send(errorMessage);
    }

    try {
        const payload = verifyJwtToken(token);

        if (!payload) {
            errorMessage.error = 'Malformed login token';
            return res.status(statusCodes.UNAUTHORIZED).send(errorMessage);
        }
        req.user = payload;
        next();
        
    } catch (err) {
        console.error(`${err.name}: ${err.message}`);

        if (err.name == 'TokenExpiredError') {
            errorMessage.error = 'Login token expired';
            return res.status(statusCodes.BAD).send(errorMessage)
        }
        errorMessage.error = 'Invalid or malformed login token';
        return res.status(statusCodes.BAD).send(errorMessage)
    }
};

export default verifyToken;