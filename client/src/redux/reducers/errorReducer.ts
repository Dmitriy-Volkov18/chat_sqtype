import errorTypes from '../types/errorTypes'
import {DispatchErrorActions} from "../actions/errorActions"

interface IError{
    msg: string,
    alertType: string,
    id: string
}

const initialState: IError[] = []

const errorReducer = (state: IError[] = initialState, action: DispatchErrorActions): IError[] => {
    switch(action.type){
        case errorTypes.ERROR:
            return [...state, action.payload]
        case errorTypes.REMOVE_ERROR:
            return state.filter(error => error.id !== action.payload)
        default:
            return state
    }
}

export default errorReducer