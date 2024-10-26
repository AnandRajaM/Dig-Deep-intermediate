const express = require('express');
const { getUserById, getAllUsers, createUser } = require('../services/userService');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const users = await getAllUsers();
        return res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching all users:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const newUser = await createUser({ username, password });
        return res.status(201).json({ user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
