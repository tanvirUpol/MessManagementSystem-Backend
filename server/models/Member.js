import mongoose from "mongoose";
import bcrypt from "bcrypt";

const MemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
        },
    phone: {
        type: String,
        required: true
        },
    password: {
        type: String,
        required: true
    },
    messName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Admin','Regular'],
        }
    })

    // static signup method

    MemberSchema.statics.signup = async function( {name,phone,password,messName,role} ){

        const exists = await this.findOne({ messName })

        

        // if(exists) {
        //     throw new Error('User already exists')
        // }


        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        console.log(hashedPassword)


        if(role == 'Admin' && exists){
            throw new Error('This mess already exists')
        }
        
        if(role == 'Admin' && !exists){
            const user = await this.create({ name,phone, password: hashedPassword,messName,role })
            return user
        } 
        

        if(role == 'Regular' && exists){
            const user = await this.create({ name,phone, password: hashedPassword,messName,role })
            return user
        } 
        
        if(role == 'Regular' &&!exists){
            throw new Error('This mess does not exists')
        }
        
    }


    // static login method

    MemberSchema.statics.login = async function({phone, password}) {

    if (!phone || !password) {
        throw new Error('phone and password are required')
   }

   const user = await this.findOne({ phone })

    if(!user) {
        throw new Error('User does not exist')
    }

    const valid = await bcrypt.compare(password, user.password)

    if(!valid) {
        throw new Error('Incorrect password')
    }

    return user

}


export default mongoose.model('Member', MemberSchema)