import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const saltRounds = 12;
const tokenExpiration = 60 * 60 * 24 * 7; // 7 days
const jwtKey = process.env.SALT;
const jwtSignOptions = {
    issuer: "Accelerate Indonesia",
    expiresIn: tokenExpiration,
    // algorithm: "RS256"
};
const jwtVerifyOptions = {
    issuer: "Accelerate Indonesia",
    expiresIn: tokenExpiration,
    // algorithms:  ["RS256"]
};

/**
 * 
 * @param {*} id 
 * @param {*} email 
 */
export const generateToken = (id, email) => {
    return jwt.sign({ id, email }, jwtKey, jwtSignOptions);
};

/**
 * 
 * @param {*} res 
 * @param {*} token 
 */
export const setTokenCookie = (res, token) => {
    res.cookie('id_token', token, {
        maxAge: 1000 * tokenExpiration,
        httpOnly: true
    })
    return res;
}

/**
 * 
 * @param {string} pwd 
 */
export const hashPwd = async (pwd) => {
    const hashed = await bcrypt.hash(pwd, saltRounds);
    return hashed;
};

/**
 * 
 * @param {string} token
 */
export const verifyJwtToken = (token) => {
    return jwt.verify(token, jwtKey, jwtVerifyOptions);
};

/**
 * 
 * @param {string} password 
 * @param {string} hashedPwd 
 */
export const verifyPassword = async (password, hashedPwd) => {
    return bcrypt.compare(password, hashedPwd);
};


/**
 * Random password generator
 * @param {int} length
 */
export const generateRandomPwd = (length) => {
    var result = '';
    // Letter "O" ommitted intentionally
    var characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}