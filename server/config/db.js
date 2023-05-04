import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`MongooDB connnected to ${conn.connection.host}`.magenta.underline.bold)
 }

 export default connectDB;
