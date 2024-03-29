import React, {useState, useEffect} from 'react'

// interface IUsers{
//     username: string, 
//     email: string, 
//     isAdmin: boolean
// }

// interface ISocket {
//     on(event: string, callback: (data: any) => void ): void;
//     emit(event: string, data: any): void;
// }


const AllUsers = ({socket}) => {
    const [fetchAllUsers, setFetchAllUsers] = useState([])

    useEffect(() => {
        socket.emit("fetchAllUsers")
    
        socket.on("fetchAllUsers", (users) => {
            if(users.length > 0){
                setFetchAllUsers(users)
            }
        })
        
    }, [fetchAllUsers, socket])

    const banUser = (username) => {
        socket.emit("banUser", username)
    }

    const unbanUser = (username) => {
        socket.emit("unBanUser", username)
    }

    const muteUser = (username) => {
        socket.emit("muteUserUsername", username)
    }

    const unmuteUser = (username) => {
        socket.emit("unMuteUserUsername", username)
    }

    return (
        <div className="allUsers-container">
            <h2>All users</h2>
            <ul>
                {
                    fetchAllUsers ? (
                        fetchAllUsers.map((user, index) => (
                            <li key={index}><span><button className="banBtn" onClick={() => banUser(user.username)}>Ban</button><button className="unbanBtn" onClick={() => unbanUser(user.username)}>Unban</button><button className="muteBtn" onClick={() => muteUser(user.username)}>Mute</button><button className="unmuteBtn" onClick={() => unmuteUser(user.username)}>Unmute</button></span>{user.username}</li>
                        ))
                    ) : <h3>No users found</h3>
                }
            </ul>
        </div>
    )
}

export default AllUsers




// const AllUsers = () => {
//     return (
//         <div>
            
//         </div>
//     )
// }

// export default AllUsers
