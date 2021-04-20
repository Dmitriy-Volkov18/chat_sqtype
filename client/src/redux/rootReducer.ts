import {combineReducers, applyMiddleware, createStore, AnyAction} from 'redux'
import userReducer from "./reducers/userReducer"
import errorReducer from "./reducers/errorReducer"

import thunk, { ThunkAction } from 'redux-thunk'
import logger from "redux-logger"

const middlewares = [logger, thunk]

export const rootReducer = combineReducers({
    user: userReducer,
    errors: errorReducer
})

export type RootReducer = ReturnType<typeof rootReducer>

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootReducer,
  unknown,
  AnyAction
>

const store = createStore(rootReducer, applyMiddleware(...middlewares))

export default store