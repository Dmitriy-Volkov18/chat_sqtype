import React, {useEffect} from 'react'
import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"

import Header from "./components/Header/Header"
import Login from "./components/Login/Login"
import Chat from "./components/Chat/Chat"
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import ErrorAlert from "./components/ErrorAlert/ErrorAlert"

import {getUser} from "./redux/actions/userActions"
import {useDispatch} from "react-redux"
import SocketContext from "./socketContext/socketContext"
import io from "socket.io-client";


function App() {
  const socket = io("http://localhost:5000", {
    auth: {token: localStorage.getItem("token")}
  });

  const dispatch = useDispatch()

  useEffect(() => {
      dispatch(getUser())
  }, [dispatch])


  return (
    <SocketContext.Provider value={socket}>
      <div className="App">
        <Router>
          <Header />
          <ErrorAlert />
          <Switch>
            <PrivateRoute exact path="/" component={Chat} />
            <Route exact path="/login" component={Login} />
          </Switch>
        </Router>
      </div>
    </SocketContext.Provider>
  );
}

export default App;

