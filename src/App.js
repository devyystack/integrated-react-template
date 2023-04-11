import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'


import Login from './pages/login'
import HigherGame from './pages/game/index.jsx'
import { setUpdate } from './redux/slice/GameSlicer';
import { register, setRegisterStatus, setLoginStatus, checkServersHealth } from './redux/slice/authSlicer';
import { getPlayerInfo } from './redux/slice/userSlicer'
import Splash from './components/Splash/Splash';
import { toggleModal, setErrorMessage } from './redux/slice/modalSlice';
import LoadingModal from './components/Modal/LoadingModal'
import './App.scss'
import getErrorMessages from './utils/getErrorMessages';

const background = ["/static/img/game/gamebackground.png"]

export default function App() {


  const isLoggedIn = useSelector(state => state.auth.isLoggedIn)
  const isRegisteredStatus = useSelector(state => state.auth.isRegisteredStatus)
  const selectedMap = useSelector(state => state.game.selectedMap)
  const dispatch = useDispatch()

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const referral = params.get('ref');
    const oldReferral = localStorage.getItem('referral')
    if (!oldReferral)
      localStorage.setItem('referral', referral || '');
  }, [])
  useEffect(() => {
    const handleRegister = async () => {
      try {
        if (isRegisteredStatus === false && isLoggedIn === true) {
          const resultAction = await dispatch(getPlayerInfo()).unwrap()
          try {
            if (resultAction.length === 0) {
              await dispatch(register()).unwrap()
            } else {
              dispatch(setRegisterStatus(true))
            }
            dispatch(setUpdate(true))
          } catch (error) {
            getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
            dispatch(setLoginStatus(false))
            throw (error)
          }
        }
      } catch (error) {
        getErrorMessages(error, dispatch, setErrorMessage, toggleModal);

        dispatch(setLoginStatus(false))
        throw (error)

      }
    }

    try {
      handleRegister();
    } catch (error) {

      getErrorMessages(error, dispatch, setErrorMessage, toggleModal);

      throw (error)
    }

  }, [isLoggedIn, isRegisteredStatus, dispatch])



  useEffect(() => {
    if (isLoggedIn) {

    }
  }, [isLoggedIn])

  useEffect(() => {

    const checkHealth = async () => {
      try {
        await dispatch(checkServersHealth()).unwrap()

      } catch (error) {
        getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
        throw error
      }
    }
    checkHealth()
    //eslint-disable-next-line 
  }, [])

  return (
    // <div className="body-container" style={{ background: `${isLoggedIn && isRegisteredStatus ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)) no-repeat top, url(${background[selectedMap]}) no-repeat top` : "white"}` }}>  // updated by
    <div className="body-container" style={{ background: `${isLoggedIn && isRegisteredStatus ? `no-repeat top, url(${background[selectedMap]}) no-repeat top` : "white"}` }}>
      {(isLoggedIn && isRegisteredStatus) ? <React.Fragment>
        <Splash />
        {/* <HigherGame background={background[selectedMap]} />   // updated by  */}
        <HigherGame />
      </React.Fragment> : <Login />}
      <LoadingModal />

    </div>

  )
}


