const express = require("express")
const app = express()

require("dotenv").config()

const db = require("./mysqlConnection")
const jwt = require("jsonwebtoken")

const userRoute = require("./Routes/UserRoute")
const authRoute = require("./Routes/AuthRoute")

app.use(express.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    next()
})

app.use("/api/users", userRoute)
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

            db.query("SELECT date FROM messages WHERE id = ?", [result.insertId], (error, result) => {
                if(error) throw error
                
                io.emit("newMessage", {
                    message,
                    date: result[0].date,
                    username: socket.currUser.username,
                    userId: socket.currUser.id
                })
            })
        })
    })

    socket.on("fetchAllMessages", () => {
        db.query("SELECT message, date, userCreated, username FROM messages", (error, result) => {
            if(error) throw error

            io.emit("fetchAllMessages", result)
        })
    })

    socket.on("fetchAllUsers", () => {
        db.query("SELECT username FROM users", (error, result) => {
            if(error) throw error

            io.emit("fetchAllUsers", result)
        })
    })

    socket.on("banUser", async (username) => {
        const clients = await io.fetchSockets();

        for(let client of clients){
            if(client.currUser.username !== username || !onlineSet.has(username)){
                continue
            }

            Object.values([...onlineSet]).forEach(onlineUser => {
                db.query("SELECT username FROM users WHERE username = ?", [onlineUser], (error, result) => {
                    if(error) throw error
                    
                    if(result == 0){
                        return
                    }

                    db.query("UPDATE users SET isBanned = 1 WHERE username = ?", [username], (error, result) => {
                        if(error) throw error

                        onlineSet.delete(client.currUser.username)
                        client.disconnect(true)
                        io.emit("fetchOnlineUsers", [...onlineSet]);
                    })
                })
            })
        }
    })

    socket.on("unBanUser", (username) => {
        db.query("SELECT username FROM users WHERE username = ?", [username], (error, result) => {
            if(error) throw error

            if(result == 0){
                return
            }

            db.query("UPDATE users SET isBanned = 0 WHERE username = ?", [username], (error, result) => {
                if(error) throw error
            })
        })
    })

    socket.on("muteUserUsername", async (username) => {
        const clients = await io.fetchSockets();

        for(let client of clients){
            if(client.currUser.username !== username || !onlineSet.has(username)){
                continue
            }

            Object.values([...onlineSet]).forEach(onlineUser => {
                if(onlineUser === username){
                    db.query("UPDATE users SET isMuted = 1 WHERE username = ?", [username], (error, result) => {
                        if(error) throw error
                    })
                }
            })

            db.query("SELECT isMuted FROM users WHERE username = ?", [username], (error, result) => {
                if(error) throw error
    
                if(result == 0){
                    return
                }
    
                io.to(client.id).emit("muteUserUsername", result[0].isMuted)
            })
        }
    })

    socket.emit("isMuted", () => {
        db.query("SELECT isMuted FROM users WHERE username = ?", [socket.currUser.username], (error, result) => {
            if(error) throw error

            if(result == 0){
                return
            }

            socket.emit("isMuted", result[0].isMuted)
        })
    })

    socket.on("unMuteUserUsername", async (username) => {
        const clients = await io.fetchSockets();

        for(let client of clients){
            if(client.currUser.username !== username || !onlineSet.has(username)){
                continue
            }

            Object.values([...onlineSet]).forEach(onlineUser => {
                if(onlineUser === username){
                    db.query("UPDATE users SET isMuted = 0 WHERE username = ?", [username], (error, result) => {
                        if(error) throw error
                    })
                }
            })

            db.query("SELECT isMuted FROM users WHERE username = ?", [username], (error, result) => {
                if(error) throw error
    
                if(result == 0){
                    return
                }
    
                io.to(client.id).emit("muteUserUsername", result[0].isMuted)
            })
        }
    })

    socket.on("disconnect", () => {
        socket.leave("chatRoom");
        
        onlineSet.delete(socket.currUser.username)
        io.emit("fetchOnlineUsers", [...onlineSet]);
        io.emit("message", socket.currUser.username + " has disconnected")
    })
});

module.exports = httpServer