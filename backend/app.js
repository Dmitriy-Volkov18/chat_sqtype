const express = require("express")
const app = express()
const db = require("./mysqlConnection")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userRoute = require("./Routes/UserRoute")
const messageRoute = require("./Routes/MessageRoute")
const authRoute = require("./Routes/AuthRoute")

require("dotenv").config()

app.use(express.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    next()
})

app.use("/api/users", userRoute)
app.use("/api/messages", messageRoute)
app.use("/api/auth", authRoute)


const httpServer = require("http").createServer(app);
const options = { 
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
  } 
};
const io = require("socket.io")(httpServer, options);

io.use(async(socket, next) => {
    try{
        const token = socket.handshake.auth.token;

        if(!token){
            return next(new Error("No token"))
        }

        const decodedUser = await jwt.verify(token, process.env.TOKENKEY)
        socket.currUser = decodedUser

        next()
    }catch(err){
        next(new Error("invalid"));
    }
})

let onlineSet = new Set()

io.on("connection", socket => {
    socket.emit("message", "Welcome to the chat")
    socket.broadcast.emit("message", socket.currUser.username + " has connected to the chat");
    
    onlineSet.add(socket.currUser.username)
    io.emit("fetchOnlineUsers", [...onlineSet]);

    socket.on("chatRoomMessage", ({chatRoom, message}) => {
        db.query('INSERT INTO messages (message, userCreated, username) VALUES (?, ?, ?)', [message, socket.currUser.id, socket.currUser.username], (error, result) => {
            if(error) throw error
        })

        io.emit("newMessage", {
            message,
            username: socket.currUser.username,
            userId: socket.currUser.id
        })
    })

    socket.on("fetchAllMessages", () => {
        db.query("SELECT message, userCreated, username FROM messages", (error, result) => {
            if(error) throw error

            io.emit("fetchAllMessages", result)
        })
    })

    socket.on("disconnect", () => {
        socket.leave("chatRoom");
        
        onlineSet.delete(socket.currUser.username)
        io.emit("fetchOnlineUsers", [...onlineSet]);
        io.emit("message", socket.currUser.username + " has disconnected")
    })
});

module.exports = httpServer