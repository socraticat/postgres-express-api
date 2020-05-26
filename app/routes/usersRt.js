import express from 'express';

import {
    createUser,
    changeUserPassword,
    editUserSelf,
    getUser,
    signInUser
} from '../controllers/usersCtrl';
import verifyToken from '../middleware/verifyToken';
import {
    verifyAccessUserEdit,
    verifyAccessUserView
} from '../middleware/verifyAccess';

const router = express.Router();

// GET Routes

// Extracts user id from token (req.user) then calls getUser
router.get('/me', verifyToken, async (req, res) => {
    getUser(req, res, req.user.id);
});

router.get('/users/:id', verifyToken, verifyAccessUserView, async (req, res) => {
    const userId = parseInt(req.params.id);

    getUser(req, res, userId);
});

// @TODO: Not in place
router.get('/users', verifyToken, verifyAccessUserView, (req, res, next) => {
    console.log(req.user);
    res.json([]);
    next();
});

// POST routes
router.post('/sign-in', signInUser);
router.post('/user', verifyToken, verifyAccessUserEdit, createUser);
//@TODO: Pwd reset goes here?

// PUT routes - Always require tokens
router.put('/me', verifyToken, editUserSelf);
router.put('/me/change-password', verifyToken, changeUserPassword);

export default router;