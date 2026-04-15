// test-db.js
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('Connection string exists:', !!MONGODB_URI);

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

// Hide password in log
const safeUri = MONGODB_URI.replace(/\/\/(.*):(.*)@/, '//***:***@');
console.log('Connecting to:', safeUri);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully!');
  console.log('Database:', mongoose.connection.name);
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection error:');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  
  if (err.message.includes('bad auth')) {
    console.error('\n⚠️  Authentication failed! Please check:');
    console.error('1. Username is correct');
    console.error('2. Password is correct');
    console.error('3. Special characters in password are URL-encoded');
  }
  
  if (err.message.includes('getaddrinfo')) {
    console.error('\n⚠️  Network error! Please check:');
    console.error('1. Your internet connection');
    console.error('2. MongoDB Atlas cluster is active');
    console.error('3. Network access allows your IP (check MongoDB Atlas IP whitelist)');
  }
  
  process.exit(1);
});
