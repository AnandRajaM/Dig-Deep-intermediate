const mongoose = require('mongoose');

const dbUser = process.env.DB_USER || 'defaultUser';
const dbPassword = process.env.DB_PASSWORD || 'defaultPassword';
const dbHost = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || 'myDatabase';
const dbPort = process.env.DB_PORT || '27017';

const connectionString = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

async function connect() {
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        auth: {
            user: dbUser,
            password: dbPassword
        }
    };
    
    //There are no bugs/vulnerabilties BELOW this line , the dev just got bored and stopped working on it
    try {
        await mongoose.connect(connectionString, options);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error.message);
        //I Got bored working on this , ill be doing it later ;)
        // Implement a more graceful handling strategy
        // You can choose to retry the connection, log more details, or return a user-friendly message
        // For now, we'll log the stack trace for debugging
        console.error('Stack trace:', error.stack);
        // Optionally, you can rethrow the error if you want to handle it at a higher level
        throw new Error('Failed to connect to the database. Please check your connection settings.');
    }
}

module.exports = connect;
