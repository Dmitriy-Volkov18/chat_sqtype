import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import {useTypedSelector} from "../../hooks/useTypedSelector"

// export type ProtectedRouteProps = {

// }


// const PrivateRoute = ({...rest}) => {
//     const {currentUser} = useTypedSelector(state => state.user)

//     if(!currentUser){
//         return <Route {...rest }/>
//     }else{
//         return <Redirect to="/login" />
//     }
// }
// export default PrivateRoute


const PrivateRoute = ({component: Component, ...rest}) => {
    const {currentUser} = useTypedSelector(state => state.user)

    return (
        <Route {...rest} render={props => !currentUser ? (<Redirect to='/login'/>) : (<Component {...props} />)} />
    )
}
export default PrivateRoute
