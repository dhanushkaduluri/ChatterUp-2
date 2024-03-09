import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        username:String,
        text:String,
        room:Number,
        timestamp:String,
        avatar:String,
        hours:String,
        minutes:String
    }
);

export const ChatModel=mongoose.model("Chat",messageSchema);

const userSchema= new mongoose.Schema(
    {
        username:String
    }
);

export const UserModel=mongoose.model("Active Users",userSchema);




