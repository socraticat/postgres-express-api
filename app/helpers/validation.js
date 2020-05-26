/**
   * isValidEmail helper method
   * @param {string} email
   * @returns {Boolean} True or False
   */
export const isValidEmail = (email) => {
    const regEx = /\S+@\S+\.\S+/;
    return regEx.test(email);
};

/**
   * validatePassword helper method
   * Rule: 6 to 20 characters which contain at least one numeric digit,
   *    one uppercase and one lowercase letter
   * @param {string} password
   * @returns {Boolean} True or False
   */
export const validatePassword = (password) => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if (password.match(regex)) {
        return true;
    }
    return false;
};
export const passwordReqText = "Password must be 6-20 characters with at least one number, one uppercase and one lowercase letter";

/**
   * isEmpty helper method
   * @param {string, integer} input
   * @returns {Boolean} True or False
   */
export const isEmpty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
    if (input.replace(/\s/g, '').length) {
        return false;
    }
    return true;
};

/**
   * empty helper method
   * @param {string, integer} input
   * @returns {Boolean} True or False
   */
export const empty = (input) => {
    if (input === undefined || input === '') {
        return true;
    }
};