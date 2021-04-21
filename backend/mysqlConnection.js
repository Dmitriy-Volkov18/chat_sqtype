const mysql = require("mysql")

const db = mysql.createConnection({
    host: "localhost",
    user: "dimon",
    password: "qwerty",
    database: "chat"
})


db.connect()

module.exports = db