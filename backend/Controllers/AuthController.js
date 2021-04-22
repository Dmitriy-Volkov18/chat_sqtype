const db = require("../mysqlConnection")

exports.getUser = async (req, res, next) => {
    try{
        db.query("SELECT * FROM users WHERE id = ?", [req.currUser.id], function(error, result){
            if(error) throw error

            console.log(result)

            res.status(400).json({
                message: result
            })
        })
    }catch(err){
        res.status(500).json({
            error: "Server error"
        })
    }
}
