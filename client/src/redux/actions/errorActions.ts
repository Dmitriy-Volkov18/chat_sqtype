import errorTypes from "../types/errorTypes"
import { v4 as uuidv4 } from 'uuid';
import {Dispatch} from "redux"

// export const setError = (err: {msg: string, alertType: string, id: string}) => ({
//     type: typeof errorTypes.ERROR,
//     payload: err
// })


// export const removeError = (id: string) => ({
//     type: errorTypes.REMOVE_ERROR,
//     payload: id
// })


// export const setAlert = (msg: string, alertType: string, timeout = 3000) => (dispatch:Dispatch) => {
//     const id = uuidv4()
    
//     dispatch(setError({msg, alertType, id}))

//     setTimeout(() => dispatch(removeError(id)), timeout)
// }

export interface ISetError{
    type: typeof errorTypes.ERROR,
    payload: {
        msg: string,
        alertType: string,
        id: string
    }
}

export interface IRemoveError{
    type: typeof errorTypes.REMOVE_ERROR,
    payload: any
}

export type DispatchErrorActions = ISetError | IRemoveError