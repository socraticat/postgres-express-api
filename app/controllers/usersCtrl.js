import {
    createNewUser,
    setUserPassword,
    getUserById,
    getUserTblById,
    getUserTblByEmail,
    updateUserProfile
} from '../db/schemas/users';

import {
    generateToken,
    setTokenCookie,
    verifyPassword
} from './auth';

import {
    isValidEmail,
    validatePassword,
    passwordReqText,
    isEmpty,
} from '../helpers/validation';

import {
    errorMessage, successMessage, statusCodes,
} from '../helpers/status';

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {int} userId 
 */
export const getUser = async (req, res, userId) => {
    if (!userId || isNaN(userId)) {
        return res.status(statusCodes.BAD).send(errorMessage);
    }
    const userData = await getUserById(userId);
    if (!userData) {
        errorMessage.error = `User ID ${userId} could not be found`;
        return res.status(statusCodes.NOT_FOUND).send(errorMessage);
    }
    res.status(statusCodes.SUCCESS).json(userData);
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export const editUserSelf = async (req, res) => {
    let {
        firstName, lastName, title
    } = req.body;

    if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(title)) {
        errorMessage.error = 'First and last names cannot be empty';
        return res.status(statusCodes.BAD).send(errorMessage);
    }
    
    try {
        const dbRes = await updateUserProfile(req.user.id, firstName, lastName, title);
        successMessage.data = { user: dbRes };
        return res.status(statusCodes.SUCCESS).send(successMessage);

    } catch (err) {
        errorMessage.error = 'Server error. Unable to update profile.';
        return res.status(statusCodes.ERROR).send(errorMessage);
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export const signInUser = async (req, res) => {
    
    const { email, password } = req.body;
    // Validations
    if (isEmpty(email) || isEmpty(password)) {
        errorMessage.error = 'Email and password fields cannot be empty';
        return res.status(statusCodes.BAD).send(errorMessage);
    }
    if (!isValidEmail(email)) {
        errorMessage.error = 'Please enter a valid E-mail address';
        return res.status(statusCodes.BAD).send(errorMessage);
    }

    try {
        let user = await getUserTblByEmail(email);

        if (!user) {
            errorMessage.error = 'No account registered with that e-mail.';
            return res.status(statusCodes.NOT_FOUND).send(errorMessage);
        }
        // Verify entered password with their encrypted pwd
        const match = await verifyPassword(password, user.password);
        if (!match) {
            errorMessage.error = 'Authentication failed. Password does not match.';
            return res.status(statusCodes.BAD).send(errorMessage);
        }

        // Generate new token
        const token = generateToken(user.id, user.email);

        // Get profile data and send back
        user = await getUserById(user.id);
        successMessage.data = { user };

        return setTokenCookie(res, token)
            .status(statusCodes.SUCCESS)
            .send(successMessage);
    }
    catch(err) {
        console.error(err);
        return err.status(statusCodes.ERROR).send('Authentication failed due to server error.');
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
export const changeUserPassword = async (req, res) => {
    
    const { currentPassword, newPassword } = req.body;
    // Validations
    if (!validatePassword(newPassword)) {
        errorMessage.error = passwordReqText;
        return res.status(statusCodes.BAD).send(errorMessage);
    }
    if (currentPassword == newPassword) {
        errorMessage.error = 'New password cannot be the same.';
        return res.status(statusCodes.BAD).send(errorMessage);
    }
    console.log(req.body);
    try {
        const user = await getUserTblById(req.user.id);
        console.log(user);
        // Verify current password with their encrypted pwd
        const match = await verifyPassword(currentPassword, user.password);
        if (!match) {
            errorMessage.error = 'Authentication failed. Current password does not match.';
            return res.status(statusCodes.BAD).send(errorMessage);
        }
        await setUserPassword(user.id, newPassword);

        successMessage.message = "Password changed successfully.";
        return res.status(statusCodes.SUCCESS).send({...successMessage});
    }
    catch(err) {
        console.error(err);
        errorMessage.error = 'Authentication failed due to server error.';
        return err.status(statusCodes.ERROR).send(errorMessage);
    }
};

/**
   * Create A User
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object
   */
export const createUser = async (req, res) => {
    const {
        email, firstName, lastName, title, roleId
    } = req.body;

    if (isEmpty(email) || isEmpty(firstName) || isEmpty(lastName) || isEmpty(title)) {
        errorMessage.error = 'Email, First/Last names and Title cannot be empty';
        return res.status(statusCodes.BAD).send(errorMessage);
    }
    if (!isValidEmail(email)) {
        errorMessage.error = 'Please enter a valid Email';
        return res.status(statusCodes.BAD).send(errorMessage);
    }

    try {
        const { newUser, tempPwd } = await createNewUser(email, firstName, lastName, title, roleId);
        // Delete hashed pwd from returned data and attach Temp
        delete newUser.password;
        newUser.tempPwd = tempPwd;

        successMessage.data = { user: newUser };
        return res.status(statusCodes.CREATED)
            .send(successMessage);

    } catch (error) {
        console.error(`ERROR: ${error.detail || error}`);
        if (error.routine === '_bt_check_unique') {
            errorMessage.error = 'User with that E-mail address already exist';
            return res.status(statusCodes.CONFLICT).send(errorMessage);
        }
        errorMessage.error = 'Server error. Operation was not successful.';
        return res.status(statusCodes.ERROR).send(errorMessage);
    }
};