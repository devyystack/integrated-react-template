/** @format */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	setLoginStatus,
	setServer,
	setSplashScreen,
	anchorLogin,
	waxLogin,
} from '../../redux/slice/authSlicer';
import InformModal from '../../components/Modal/InformModal.jsx';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import getErrorMessages from '../../utils/getErrorMessages';

export default function Login() {
	const dispatch = useDispatch();
	// const [account, setAccount] = useState("");
	// const [key, setKey] = useState("");
	// const isLoginable = key !== "" && account !== "";
	// const login = (e) => {
	// 	e.preventDefault();
	// 	if (isLoginable) {
	// 		dispatch(submitUser({ account: account, key }));
	// 		dispatch(setSplashScreen(true));
	// 	} else {
	// 		dispatch(
	// 			setErrorMessage(
	// 				"Please Enter Your Username and Privatekey to continue."
	// 			)
	// 		);
	// 		dispatch(toggleModal(true));
	// 	}
	// };
	const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
	const servers = useSelector((state) => state.auth.servers);
	const [isModalOpened, setModalOpen] = useState(false);
	const anchorLoginHandle = async (e) => {
		e.preventDefault();
		try {
			if (isLoggedIn) {
				dispatch(setLoginStatus(false));
				setTimeout(() => dispatch(setLoginStatus(true)), 1000);
			} else await dispatch(anchorLogin()).unwrap();
			dispatch(setSplashScreen(true));
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		}
	};

	const waxLoginHandle = async (e) => {
		e.preventDefault();
		try {
			if (isLoggedIn) {
				dispatch(setLoginStatus(false));
				setTimeout(() => dispatch(setLoginStatus(true)), 1000);
			} else await dispatch(waxLogin()).unwrap();
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		}
		dispatch(setSplashScreen(true));
	};

	return (
		<div
			className='login-container'
			// style={{ backgroundImage: url('/static/img/bg_login.png') }}
		>
			<InformModal />

			<div className='login-content'>
				{/* <div className='temp-login-input'>

					<input
						type='text '
						className='login-input'
						value={account}
						onChange={(e) => setAccount(e.target.value)}
						placeholder='Your Account here'
					/>
					<input
						type='text '
						className='login-input'
						value={key}
						onChange={(e) => setKey(e.target.value)}
						placeholder='Your Beautiful private key here'
					/>

				</div> */}

				{/* <button className="login-button" onClick={(e) => login(e)}>
                    LOGIN
                </button> */}

				<label htmlFor='RPC-Endpoint'>
					{servers.length === 0 ? 'No servers found' : 'RPC Endpoints'}
				</label>

				<select
					id='RPC-Endpoint'
					onChange={(event) => dispatch(setServer(event.target.value))}>
					<option
						disabled
						value='none'
						name='none'
						style={{ textAlign: 'center' }}>
						Select RPC Endpoint
					</option>

					{servers.map((server, index) => (
						<option key={index} value={index} name={server}>
							{server}
						</option>
					))}
					{/* <option value="volvo">Volvo</option>
                    <option value="saab">Saab</option>
                    <option value="opel">Opel</option>
                    <option value="audi">Audi</option> */}
				</select>
				<button className='login-button' onClick={() => setModalOpen(true)}>
					
				</button>
			</div>
			{isModalOpened && (
				<div>
					<div
						className='modal-wrapper'
						onClick={() => setModalOpen(false)}></div>

					<div className='login-modal-container'>
						<p className='login-modal-header'>Select Wallet</p>
						<button
							className='login-modal-button'
							disabled={servers.length === 0}
							onClick={(e) => waxLoginHandle(e)}>
							<img
								className='login-button--img'
								src='/static/img/brands/wax-primary-logo.png'
								alt='wax-cloud-wallet'
							/>

							<p className='login-button--text'>Wax Wallet Account</p>
						</button>
						<button
							className='login-modal-button'
							disabled={servers.length === 0}
							onClick={(e) => anchorLoginHandle(e)}>
							<img
								className='login-button--img'
								src='/static/img/brands/anchor.png'
								alt='anchor'
							/>
							<p className='login-button--text'>Anchor</p>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
