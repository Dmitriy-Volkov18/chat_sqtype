import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import {useTypedSelector} from "../../hooks/useTypedSelector"

const PrivateRoute: React.FC<{component: React.FC, path: string, exact: boolean}> = (props) => {
    const {currentUser} = useTypedSelector(state => state.user)

    return currentUser ? 
        (<Route path={props.path}  exact={props.exact} component={props.component}  />) : (<Redirect to='/login'/>)
}
export default PrivateRoute
