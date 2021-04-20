import userTypes from '../types/userTypes'
import {IUser, UserDispatchTypes} from "../actions/userActions"

interface IUserState {
    token: string | null,
    currentUser: IUser | null,
    isAdmin: boolean,
    isLoggedIn: boolean,
    error: string | null
}

const initialState: IUserState = {
    token: localStorage.getItem("token"),
    currentUser: null,
    isAdmin: false,
    isLoggedIn: false,
    error: null
}

const userReducer = (state: IUserState = initialState, action: UserDispatchTypes): IUserState => {
    switch(action.type){
        case userTypes.LOGIN_SUCCESS:
            localStorage.setItem("token", JSON.stringify(action.payload.token))
            return {...state, token: action.payload.token, currentUser: action.payload.currentUser, isAdmin: action.payload.isAdmin, isLoggedIn: true, error: null}
        case userTypes.LOGIN_FAILURE:
            return {...state, currentUser: null, isLoggedIn: false, error: action.payload.error}
        case userTypes.LOGOUT:
            localStorage.removeItem("token")
            return {...state, token: null, currentUser: null, isLoggedIn: false, error: null, isAdmin: false}
        default:
            return state
    }
}

export default userReducer