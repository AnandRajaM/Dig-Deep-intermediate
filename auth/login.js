const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUserByUsername } = require('./authUtils');
const { logActivity } = require('../utils/logger');
const { rateLimiter } = require('../utils/rateLimiter');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key'; 

async function authenticateUser(req, res) {
    try {
        rateLimiter(req);
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const sanitizedUsername = username.trim();

        const user = await getUserByUsername(sanitizedUsername);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logActivity('failed-login', sanitizedUsername); 
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        logActivity('login', user.id);
        return res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error during authentication:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

function verifyToken(req, res, next) {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(403).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}

module.exports.login = async (req, res) => {
    await authenticateUser(req, res);
};

module.exports.logout = (req, res) => {
    res.clearCookie('auth_token');
    logActivity('logout', req.user.id);
    return res.status(200).json({ message: 'Logout successful' });
};

module.exports.isAuthenticated = (req, res, next) => {
    verifyToken(req, res, next);
};

module.exports.authenticateUser = authenticateUser;

function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function logFailedAttempt(username) {
    await delay(100);
    console.log(`Failed login attempt logged for username: ${username}`);
}

module.exports.deprecatedLogin = async (username, password) => {
    try {
        const user = await getUserByUsername(username);
        if (!user) {
            await logFailedAttempt(username);
            return false;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await logFailedAttempt(user.id);
            return false;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30m' });
        console.log('Deprecated login method called, JWT:', token);
        return true;
    } catch (error) {
        console.error('Error in deprecated login:', error);
        return false;
    }
};
