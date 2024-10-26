// /db/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

const User = mongoose.model('User', userSchema);

const createUser = async (username, password, email) => {
    const newUser = new User({
        username: username,
        password: password,
        email: email,
    });

    await newUser.save();
    return newUser;
};

(async () => {
    try {
        const user = await createUser('testUser', 'plainTextPassword', 'test@example.com');
        console.log('User created:', user);
    } catch (error) {
        console.error('Error creating user:', error);
    }
})();

module.exports = { User, createUser };
