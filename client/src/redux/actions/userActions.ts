import userTypes from '../types/userTypes'
import errorTypes from "../types/errorTypes"
import axios from "axios"
import {AnyAction, Dispatch} from "redux"
import { v4 as uuidv4 } from 'uuid';
import { ThunkAction } from 'redux-thunk';
import {RootReducer} from "../rootReducer"

export const logout = () => ({
    type: userTypes.LOGOUT
})

export interface IUser{
    id: string,
    username: string,
    email: string
}

export interface ILoginStart{
    type: typeof userTypes.LOGIN_START
}

export interface ILoginSuccess{
    type: typeof userTypes.LOGIN_SUCCESS,
    payload: {
        token: string,
        currentUser: IUser,
        isAdmin: boolean,
        isLoggedIn: boolean,
        error: null
    }
}

export interface ILoginFailure{
    type: typeof userTypes.LOGIN_FAILURE,
    payload: {
        token: null,
        currentUser: null,
        isAdmin: boolean,
        isLoggedIn: boolean,
        error: string
    }
}

export interface ILogout{
    type: typeof userTypes.LOGOUT,
    payload: {
        token: null,
        currentUser: null,
        isAdmin: boolean,
        isLoggedIn: boolean,
        error: null
    }
}

export type UserDispatchTypes = ILoginSuccess | ILoginFailure | ILogout


export const loginUser = (userData: {username: string, email: string, password: string}) => async(dispatch: Dispatch) => {
    try{
        dispatch({type: userTypes.LOGIN_START})

        let response = await axios.post("http://localhost:5000/api/users/signup",  JSON.stringify(userData), {headers: {
                    'Content-Type': 'application/json'
                }})

        const data = await response.data
        const currentUser = data.user
        const isAdmin = data.isAdmin
        const token = data.token
        const isBanned = data.isBanned

        if(!isBanned){
            dispatch({type: userTypes.LOGIN_SUCCESS, payload: {token, currentUser, isAdmin}})
        }else{
            ["You are banned!)):D:D:p"].forEach((msg: string) => {
                const id = uuidv4()
                const alertType = "danger"
                dispatch({type: errorTypes.ERROR, payload: {msg, alertType, id}})
                setTimeout(() => dispatch({type: errorTypes.REMOVE_ERROR, payload: id}), 3000)
            });
        }
    }catch(err){
        console.log(err)
        const errors = err.response.data.errors
        dispatch({type: userTypes.LOGIN_FAILURE, payload: errors})

        if(errors){
            errors.forEach((error: {msg:string}) => {
                console.log(error.msg)
                let msg = error.msg
                const id = uuidv4()
                const alertType = "danger"
                dispatch({type: errorTypes.ERROR, payload: {msg, alertType, id}})
                setTimeout(() => dispatch({type: errorTypes.REMOVE_ERROR, payload: id}), 3000)
            });
        }
    }
}

// export const getUser = (): ThunkAction<void, RootReducer, unknown, AnyAction> => async(dispatch: Dispatch, getState) => {
//     try{
//         dispatch({type: userTypes.LOGIN_START})

//         const token = getState().user.token
//         console.log(token)

        
//         const config = {
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         }
        
//         // if(token){
//         //     // config.headers.authorization = token
//         //     axios.defaults.headers.common['Authorization'] = token;
//         // }else{
//         //     return
//         // }

//         let response = await axios.get("http://localhost:5000/api/auth/user", {
//             headers: {
//                 'Content-Type': 'application/json',
//                 "Authorization": "Bearer" + token
//             }
//         })
//         const data = await response.data
//         const currentUser = data.user
//         const isAdmin = data.isAdmin
//         dispatch({type: userTypes.LOGIN_SUCCESS, payload: {token, currentUser, isAdmin}})
//     }catch(err){
//         const errors = err.response.data.errors
//         dispatch({type: userTypes.LOGIN_FAILURE, payload: errors})
//     }
// }
