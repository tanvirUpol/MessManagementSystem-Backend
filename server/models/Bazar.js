import mongoose from "mongoose"

const BazarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    memberId: {
        type: String,
        required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
    
    })


export default mongoose.model('Bazar', BazarSchema)