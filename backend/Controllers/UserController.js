const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const db = require("../mysqlConnection")

exports.getAllUsers = async (req, res, next) => {
    try{
        
    }catch(err){
        res.status(500).json({
            error: "Server error"
        })
    }
}


exports.getUserByUsername = async (req, res, next) => {
    try{
        
    }catch(err){
        res.status(500).json({
            error: "Server error"
        })
    }
}

exports.getBannedUser = async (req, res, next) => {
    try{
        
    }catch(err){
        res.status(500).json({
            error: "Server error"
        })
    }
}

const createToken = (user) => {
    const token = jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
    }, process.env.TOKENKEY, {expiresIn: "1h"})

    return token
}


const register = async (res, username, email, password, isAdmin) => {
    try{
        const hashedPassword = await bcrypt.hash(password, 10)

        db.query('INSERT INTO users (username, email, password, isAdmin) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, isAdmin], function(error){
            if(error) throw error
        })

        db.query("SELECT * FROM users WHERE username = ? AND email = ?", [username, email], function (error, result){
            if(error) throw error

            const token = createToken(result[0])

            const newUser = {
                id: result[0].id,
                username: result[0].username,
                email: result[0].email
            }
            
            // db.end();

            return res.status(201).json({
                token: token,
                user: newUser,
                isAdmin: isAdmin,
                isBanned: 0
            })
        })
    }catch(err){
        res.status(500).json({
            error: "Something went wrong"
        })
    }
}

exports.signup = async (req, res, next) => {
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

        db.query('SELECT COUNT(*) as count FROM users', async function (error, results, fields) {
            if (error) throw error;
            
            const usersCount = results[0].count

            if(usersCount <= 0){
                isAdmin = 1
                register(res, username, email, password, isAdmin)
            }else{
                db.query("SELECT * FROM users WHERE username = ? AND email = ?", [username, email], async function(error, result){
                    try{
                        if(error) throw error
                    
                        if(result.length === 0){
                            isAdmin = 0
                            register(res, username, email, password, isAdmin)
                        }else{
                            const match = await checkPasswords2(password, result[0].password)
        
                            if(!match){
                                errors.push({msg: "Incorrect password"})
                            }
        
                            if(errors.length > 0){
                                return res.status(400).json({
                                    errors
                                })
                            }
        
                            const token = createToken(result[0])
        
                            const user = {
                                id: result[0].id,
                                username: result[0].username,
                                email: result[0].email
                            }

                            // db.end();
        
                            return res.status(201).json({
                                token: token,
                                user: user,
                                isAdmin: result[0].isAdmin,
                                isBanned: result[0].isBanned
                            })
                        }
                    }catch(err){
                        res.status(500).json({
                            error: err
                        })
                    }
                })
            }
        });

        
    }catch(err){
        res.status(500).json({
            error: err
        })
    }
}

function checkPasswords2(password, hashedPassword){
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashedPassword, (err, res) => {
            if(err) reject(err)

            resolve(res)
        })
    })
}

exports.createMessage = async (req, res, next) => {
    try{
        
    }catch(err){
        res.status(500).json({
            error: err
        })
    }
}


exports.deleteAllUsers = async (req, res, next) => {
    try{
        
    }catch(err){
        res.status(500).json("Server error")
    }
}