const express = require("express")
const app = express()

const mysql = require("mysql")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

app.use(express.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    next()
})

const connection = mysql.createConnection({
    host: "localhost",
    user: "dimon",
    password: "qwerty",
    database: "chat"
})


connection.connect()

// connection.query('INSERT INTO users (username, password, email, isAdmin, isMuted, isBanned) VALUES ("dim22a", "123456", "admin1@gmail.com", 1, 0, 0)', function (error, results, fields) {
//     if (error) throw error;
//     console.log('The solution is: ', results);
// });


const createToken = (user) => {
    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email,
    }, process.env.TOKENKEY, {expiresIn: "1h"})

    return token
}


const register = async (res, username, email, password, isAdmin) => {
    try{
        const hashedPassword = await bcrypt.hash(password, 10)

        connection.query('INSERT INTO users (username, password, email, isAdmin) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, isAdmin], function(error, result, fields){
            if(error) throw error

            console.log("registered")
            console.log(result)

            // const token = createToken(savedUser)

            
        })

        connection.query("SELECT * FROM `users` WHERE `email` = ?", ["admin@gmail.com"], function(error, result, fields){

            console.log(result)
            const newUser = {
                username: username,
                email: email
            }
            
            connection.end();

            return res.status(201).json({
                // token: token,
                user: newUser,
                isAdmin: isAdmin,
                isBanned: 0
            })
        })
    }catch(err){
        res.status(500).json({
            error: err
        })
    }
}

app.post("/", async (req, res, next) => {
    try{
        let isAdmin
        const {username, email, password} = req.body
        let errors = []


        if(!username || !email || !password){
            errors.push({msg: "Please enter all required fields"})
        }
        
        const usernameRegex = /^[a-zA-Z0-9~@#$^*()_+=[\]{}|\\,.?: -]*$/
        if(!usernameRegex.test(username)) {
            errors.push({msg: "Username cannot contain any special characters"})
        }

        if(username.length < 3){
            errors.push({msg: "Username is less than 3 characters"})
        }

        const emailRegex = /gmail.com|mail.com$/
        if(!emailRegex.test(email)) {
            errors.push({msg: "Enter a correct email"})
        }

        if(password.length < 6){
            errors.push({msg: "Password is less than 6 characters"})
        }

        if(errors.length > 0){
            return res.status(400).json({
                errors
            })
        }

        connection.query('SELECT COUNT(*) as count FROM users', async function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results[0].count);

            const usersCount = results[0].count

            if(usersCount <= 0){
                isAdmin = true
                register(res, username, email, password, isAdmin)
            }else{
                connection.query("SELECT * FROM users WHERE `username` = ? AND `email` = ?", [username, email], function(error, results, fields){
                    if(error) throw error
                    
                    console.log("found ")
                    console.log(results)

                    if(results.length > 0){
                        console.log("if statement")
                        isAdmin = false
                        register(res, username, email, password, isAdmin)
                        // connection.end();

                    }


                })

                // if(!existingUser){
                //     isAdmin = false
                //     register(res, username, email, password, isAdmin)
                // }else{
                //     const match = await checkPasswords2(password, existingUser.hashedPassword)

                //     if(!match){
                //         errors.push({msg: "Incorrect password"})
                //     }

                //     if(errors.length > 0){
                //         return res.status(400).json({
                //             errors
                //         })
                //     }

                //     const token = createToken(existingUser)

                //     const user = {
                //         id: existingUser._id,
                //         username: existingUser.username,
                //         email: existingUser.email
                //     }

                //     return res.status(201).json({
                //         token: token,
                //         user: user,
                //         isAdmin: existingUser.isAdmin,
                //         isBanned: existingUser.status.isBanned
                //     })
                // }
            }
        });

        
    }catch(err){
        res.status(500).json({
            error: err
        })
    }
})

function checkPasswords2(password, hashedPassword){
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashedPassword, (err, res) => {
            if(err) reject(err)

            resolve(res)
        })
    })
}
   





const httpServer = require("http").createServer(app);
const options = { 
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
  } 
};
const io = require("socket.io")(httpServer, options);

// io.use(async(socket, next) => {
    
// });

let onlineSet = new Set()

io.on("connection", async socket => {

    socket.emit("message", "Welcome to the chat")
    socket.broadcast.to("chatRoom").emit("message", " has connected to the chat");
    

    socket.on("disconnect", () => {
        
    })
 });

module.exports = httpServer