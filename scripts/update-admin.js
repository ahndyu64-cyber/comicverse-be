require('dotenv').config();
const mongoose = require('mongoose');

async function updateAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comicverse');
    
    const result = await mongoose.connection.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId('6911b8cd75193075abcdeb43') },
      { $set: { roles: ['user', 'admin'] } }
    );
    
    console.log('Update result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAdmin();