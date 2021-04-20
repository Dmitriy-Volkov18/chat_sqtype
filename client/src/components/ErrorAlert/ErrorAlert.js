import React from 'react'
import {connect, ConnectedProps} from "react-redux"
import "./ErrorAlert.styles.css"
import {useTypedSelector} from "../../hooks/useTypedSelector"

const ErrorAlert = ({errors}) => errors !== null && errors.length > 0 
    && errors.map((error, index) => (
        <div key={index} className="errorAlert-block">
            <p className={`errorAlert-${error.alertType}`}>{error.msg}</p>
        </div>
    )
)

const mapStateToProps = (state) => ({
    errors: state.errors
})

export default connect(mapStateToProps)(ErrorAlert)


// const mapStateToProps = (state: IRootErrorsState) => ({
//     errors: state.errors
// })

// const connector = connect(mapStateToProps, null)
// type PropsFromRedux = ConnectedProps<typeof connector>

// type Props = PropsFromRedux & {
//   backgroundColor: string
// }

// export default connect(ErrorAlert)