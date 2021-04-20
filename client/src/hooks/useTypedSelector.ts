import {TypedUseSelectorHook, useSelector} from "react-redux"
import {RootReducer} from "../redux/rootReducer"

export const useTypedSelector: TypedUseSelectorHook<RootReducer> = useSelector