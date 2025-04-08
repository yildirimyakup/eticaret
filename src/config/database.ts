import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/e-ticaret');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Error connecting to database:');
        if (error instanceof Error) {console.error(error.message);
        } else {
            console.error('Unknown error occurred');
        }
        
        // Test ortamında çalışırken process.exit kullanmayalım
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        } else {
            // Test ortamında hata durumunda Promise rejection kullanarak hata fırlatabilirsiniz
            throw error;
        }
    }
}

export default connectDB;
