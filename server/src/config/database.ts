import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deadlizard_calendar';
    
    console.log('🔍 Attempting MongoDB connection...');
    console.log('🔍 MongoDB URI configured:', mongoURI ? 'Yes' : 'No');
    
    await mongoose.connect(mongoURI);
    
    console.log('📊 MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Continuing without database - some features may not work');
    
    // Don't exit process even in production - let the server continue to run
    // The health check and basic functionality should still work
    console.log('⚠️  Server will continue running without database');
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📊 Mongoose disconnected from MongoDB');
});
