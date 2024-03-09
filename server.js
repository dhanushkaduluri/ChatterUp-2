import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ChatModel, UserModel } from './message.schema.js';

const app = express();
app.use(cors());

export const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

const activeUsers=[];

io.on("connection", (socket) => {
    console.log("Connection made.");

    socket.on("join", async(data) => {
       
        const newUser=new UserModel({username:data.username});
        await newUser.save();
        const userCount=await UserModel.countDocuments({})-1;
        const prevUsers=await UserModel.find();
        // Emiting a welcome message to the user who joined
        socket.emit("server-message", { text: `Welcome, ${data.username}!`,userCount:userCount,prevUsers:prevUsers });

        // Broadcasting a message to all other users in the same room
        socket.broadcast.to(data.room).emit("server-message", {
            text: `${data.username} has joined the room.`
        });

       io.emit("details", {
            userCount:userCount ,prevUsers:prevUsers
        });

        // Join the room
        socket.join(data.room);

        // Store user information in the socket
        socket.user = {
            username: data.username,
            room: data.room,
            avatar: data.avatar // Assuming you have avatar information
        };
    });

    socket.on("sendMessage", async (data) => {
        let cnt = await ChatModel.countDocuments({});

        // Write your code here
        const newChat = new ChatModel({
            username: data.username,
            text: data.message,
            room: data.room,
            timestamp: new Date().toLocaleTimeString(),
            avatar: data.avatar,
            hours:data.hours,
            minutes:data.minutes
        });

        newChat.save();

        // Broadcast the received message to all users in the same room
        socket.broadcast.to(data.room).emit("message", newChat);
    });

    socket.on('typingStatus', (data) => {
        socket.broadcast.to(data.room).emit("typing", { status: data.status });
    });

    socket.on("disconnect", async() => {
        // Access user information from the socket
        const disconnectedUser = socket.user;

        if (disconnectedUser) {
            await UserModel.deleteOne({username:disconnectedUser.username});

            const prevUsers=await UserModel.find();
    
            const userCount=await UserModel.countDocuments({})-1;

            socket.broadcast.to(disconnectedUser.room).emit("server-message", {
                text: `${disconnectedUser.username} exited from group ${disconnectedUser.room}.`
            });

            socket.broadcast.to(disconnectedUser.room).emit("details", {
                userCount:userCount,prevUsers:prevUsers
            });

            console.log(`${disconnectedUser.username} disconnected from ${disconnectedUser.room}.`);
            // You can now handle the disconnect event for this user
        } else {
            console.log("Connection disconnected without user information.");
        }
    });
});
