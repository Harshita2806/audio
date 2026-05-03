const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Matches the MONGODB_URI in your .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;