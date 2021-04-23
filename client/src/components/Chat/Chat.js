import React, {useState, useEffect, useRef} from 'react';
import { io } from "socket.io-client";

import Message from '../Message/Message';

// import AllUsers from '../AllUsersCopy/AllUsers';
import "./Chat.styles.css"
import {useSelector, useDispatch} from "react-redux"
import {logout} from "../../redux/actions/userActions"
// import SocketContext from "../../socketContext/socketContext"

const Chat = () => {
    const socketRef = useRef();
    const chat_body_ref = useRef()
    const messageRef = useRef()
    const lastMessage = useRef()

    const [fetchedAllMessages, setFetchedAllMessages] = useState([])
    const [newMessages, setNewMessages] = useState([])
    const [messages, setMessages] = useState([])
    const [onlineUsers, setOnlineUsers] = useState([])
    const [userId, setUserId] = useState("")

    const token = useSelector(state => state.user.token)
    const isAdmin = useSelector(state => state.user.isAdmin)

    const dispatch = useDispatch()

    // const socket = useContext(SocketContext)

    useEffect(() => {
        if(token){
            const payload = JSON.parse(atob(token.split(".")[1]))
            setUserId(payload)
        }
        socketRef.current = io("http://localhost:5000", {
            auth: {token}
        });

        socketRef.current.on("fetchOnlineUsers", (onlineUser) => {
            setOnlineUsers(onlineUser)
        })

        socketRef.current.on("disconnect", () => {
            dispatch(logout())
        })

        // socketRef.current.on("error", () => {
        //     dispatch(logout())
        // })

        return () => {
            socketRef.current.close()
        }
    }, [token, dispatch])

    useEffect(() => {
        socketRef.current.on("newMessage", (message) => {
            setNewMessages([...newMessages, message])
            lastMessage.current = message
        })
    }, [newMessages, token])

    useEffect(() => {
        socketRef.current.on("message", (msg) => {
            setMessages(m => [...m, msg])
        });
    }, [])

    useEffect(() => {
        socketRef.current.emit("fetchAllMessages")

        socketRef.current.on("fetchAllMessages", (messages) => {
            setFetchedAllMessages(messages)
        })
    }, [])

    useEffect(() => {
        chat_body_ref.current.scrollTop = chat_body_ref.current.scrollHeight
    })

    const [mute, setMuted] = useState(false);

    useEffect(() => {
        socketRef.current.on("muteUserUsername", (muteValueq) => {
            setMuted(muteValueq)
        })

        socketRef.current.on("unMuteUserUsername", (muteValueq) => {
            setMuted(muteValueq)
        })
    })

    useEffect(() => {
        socketRef.current.on("isMuted", (muteValueq) => {
            setMuted(muteValueq)
        })
    })

    function getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';

        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
    }

    const emitMessage = () => {
        socketRef.current.emit("chatRoomMessage", {
            chatRoom: "chatRoom",
            message: messageRef.current.value
        })

        messageRef.current.value = ""
    }

    const handleSendMessage = () => {
        if(!messageRef?.current?.value) {
            return;
        }

        if(lastMessage?.current?.date){
            if(new Date(lastMessage.current.date).getTime() > new Date(lastMessage.current.date).getTime() + 3000){
                emitMessage()
            }else{
                setTimeout(() => {
                    emitMessage()
                }, 3000)
            }
        }else{
            emitMessage()
        }
    }

    const [fetchAllUsers, setFetchAllUsers] = useState([])
    
    useEffect(() => {
        socketRef.current.emit("fetchAllUsers")
    
        socketRef.current.on("fetchAllUsers", (users) => {
            if(users.length > 0){
                // const found = users.every(r=> fetchAllUsers.includes(r))
                // console.log(found)
                // if(found){
                    setFetchAllUsers(users)
                // }

            }

            // setFetchAllUsers(users)
        })
    }, [])



    const banUser = (username) => {
        socketRef.current.emit("banUser", username)
    }

    const unbanUser = (username) => {
        socketRef.current.emit("unBanUser", username)
    }

    const muteUser = (username) => {
        socketRef.current.emit("muteUserUsername", username)
    }

    const unmuteUser = (username) => {
        socketRef.current.emit("unMuteUserUsername", username)
    }

    return (
        <div className="chat_container">
            <h1>Welcome to the chat</h1>
            
            <div className="chat-ui">
                <div className="online-users-container">
                    <h2>Online users</h2>
                    <ul>
                        {
                            Object.values(onlineUsers).map((onlineUser, index) => 
                                (<li key={index} style={{color:getRandomColor()}}>{onlineUser}</li> )
                            )
                        }
                    </ul>
                </div>

                <div className="chat-block">
                    <div className="chat-header"></div>

                    <div className="chat-body-block" ref={chat_body_ref}>
                        {
                            fetchedAllMessages.length > 0 &&
                            fetchedAllMessages.map((message, index) => (
                                <Message
                                    key={index} message={message}
                                    specificClass={userId.id === message.userCreated ? "currentUser" : "anotherUser"}
                                    currentUser={userId.id === message.userCreated ? true : false}
                                    color1={{color:getRandomColor()}}
                                />
                            ))
                        }
                        {
                            messages.map((message, index) => 
                                (<Message key={index} message={message} />)
                            ) 
                        }
                        {
                            newMessages.map((message, index) => ( 
                                <Message
                                    key={index} message={message}
                                    specificClass={userId.id === message.userId ? "currentUser" : "anotherUser"}
                                    currentUser={userId.id === message.userId ? true : false}
                                    color1={{color:getRandomColor()}}
                                />
                            )) 
                        }
                    </div>

                    <div className="form-block">
                        <textarea name="userMessage" ref={messageRef} placeholder={`${mute ? "You`ve been muted" : "Type a message 1 to 200 characters, 1 msg in 15 secs"}`} disabled={mute} />
                        <button onClick={handleSendMessage}>Send</button> 
                    </div>
                </div>

                {/* {
                    isAdmin && (<AllUsers socket={socketRef.current} />)
                } */}

                {
                    isAdmin && 
                    (<div className="allUsers-container">
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
                    </div>)
                }
            </div>
        </div>
    )
}

export default Chat