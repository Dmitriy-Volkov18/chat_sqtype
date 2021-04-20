import {combineReducers, applyMiddleware, createStore} from 'redux'
import userReducer from "./reducers/userReducer"
import errorReducer from "./reducers/errorReducer"

import thunk from 'redux-thunk'
import logger from "redux-logger"

const middlewares = [logger, thunk]

export const rootReducer = combineReducers({
    user: userReducer,
    errors: errorReducer
})

export type RootReducer = ReturnType<typeof rootReducer>

const store = createStore(rootReducer, applyMiddleware(...middlewares))

export default store