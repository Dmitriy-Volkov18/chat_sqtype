import React, {Fragment} from 'react'
import "./ErrorAlert.styles.css"
import {useTypedSelector} from "../../hooks/useTypedSelector"

const ErrorAlert = () => {
    const {errors} = useTypedSelector(state => state)
    return (
        <Fragment>
            {errors !== null && errors.length > 0 
            && errors.map((error, index) => (
                <div key={index} className="errorAlert-block">
                    <p className={`errorAlert-${error.alertType}`}>{error.msg}</p>
                </div>
            ))}
        </Fragment>
    )
}

export default ErrorAlert
