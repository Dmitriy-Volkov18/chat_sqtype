const db = require("../mysqlConnection")

exports.getUser = async (req, res, next) => {
    try{
        db.query("SELECT * FROM users WHERE id = ?", [req.currentUser.id], function(error, result){
            if(error) throw error

            const user = {
                id: result[0].id,
                username: result[0].username,
                email: result[0].email
            }

            const admin = result[0].isAdmin == 1 ? true : false

            res.status(200).json({
                user: user,
                isAdmin: admin
            })
        })
    }catch(err){
        res.status(500).json({
            error: "Server error"
        })
    }
}
