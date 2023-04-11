/** @format */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import RegisterModal from './RegisterModal';
import SettingsModal from './SettingsModal';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import getErrorMessages from '../../utils/getErrorMessages';
import { setBackgroundUpdate } from '../../redux/slice/GameSlicer';
import {
	enable2FA,
	getAuthStatus,
	login2FA,
	resetSignature,
	setLogin2FA,
} from '../../redux/slice/authSlicer';
import lockIcon from '../../assets/img/lock.png';
import unlockIcon from '../../assets/img/unlock.png';
import VerifyModal from './VerifyModal';
import Inform2FAModal from './Inform2FAModal';

export default function Account2fa() {
	const dispatch = useDispatch();
	const [isOpen, setOpen] = useState(false);
	const [isVerifyModal, setVerifyModal] = useState(false);
	const authSettings = useSelector((state) => state.auth.authSettings);
	const isSCReistered2FA = useSelector((state) => state.auth.isSCReistered2FA);

	const isUnlocked2FA = useSelector((state) => state.auth.isUnlocked2FA);
	const isLogin2FA = useSelector((state) => state.auth.isLogin2FA);

	const [isOpenRegisterModal, setOpenRegisterModal] = useState(false);
	const user = useSelector((state) => state.user.info);

	const timestamp = useSelector((state) => state.auth.timestamp);
	const [isError, setError] = useState(false);
	const [isInform, setInform] = useState(false);
	const [isFetch, setFetch] = useState(false);
	const checkAuthTimestamp = () => {
		if (timestamp) {
			let newTime = timestamp * 1000 - Date.now();

			if (newTime <= 0) {
				dispatch(resetSignature());
			}
		}
	};
	useEffect(() => {
		let timer1 = setTimeout(() => {
			checkAuthTimestamp();
		}, 1000);
		return () => {
			clearTimeout(timer1);
		};
	});

	useEffect(() => {
		const token = localStorage.getItem(`s.id ${ !!user ? user.account : ''}`);
		if (!!token) {
			dispatch(setLogin2FA(true));
		} else dispatch(setLogin2FA(false));
	}, [user, dispatch]);

	const handleLogin = async () => {
		try {
			const response = await dispatch(login2FA()).unwrap();
			console.log(response);
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			setBackgroundUpdate(true);
		}
	};

	const handleEnable = async () => {
		try {
			if (!isLogin2FA) {
				await dispatch(login2FA()).unwrap();
			}
			const res = await dispatch(enable2FA()).unwrap();
			if (res.name) {
				setOpen(false);
				setOpenRegisterModal(true);
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			setBackgroundUpdate(true);
		}
	};

	const handleDisable = async () => {
		try {
			if (!isLogin2FA) {
				await dispatch(login2FA()).unwrap();
			}
			setOpen(false);
			setVerifyModal(1);
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);

			setBackgroundUpdate(true);
		}
	};

	const controllerHandler = async (e) => {
		e.preventDefault();
		try {
			if (!isLogin2FA) {
				await dispatch(login2FA()).unwrap();
			}
			if (!isFetch) {
				const response = await dispatch(getAuthStatus()).unwrap();
				setFetch(true);
				if (response.enabled) {
					if (!!response.locked) setOpen(true);
					else setOpenRegisterModal(true);
				} else setOpen(true);
			} else {
				if (authSettings.enabled) {
					if (!!authSettings.locked) setOpen(true);
					else setOpenRegisterModal(true);
				} else setOpen(true);
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			setBackgroundUpdate(true);
		}
	};

	return (
		<>
			<div className='button-wrapper'>
				{/* <input                            // updated by
					type='image'
					src={isUnlocked2FA ? unlockIcon : lockIcon}
					onClick={controllerHandler}
					width='48'
					height='48'
					alt='2fa-lock'
				/>

				{isOpenRegisterModal && (
					<RegisterModal
						HandleCancel={() => setOpenRegisterModal(false)}
						account={authSettings}
					/>
				)}
				{isOpen && (
					<SettingsModal
						isSCReistered2FA={isSCReistered2FA}
						HandleCancel={() => setOpen(false)}
						__features={authSettings.features}
						unlockDuration={authSettings.unlockDuration}
						handleLogin={handleLogin}
						isLogin2FA={isLogin2FA}
						handleEnable={handleEnable}
						handleDisable={handleDisable}
						isUnlocked2FA={isUnlocked2FA}
						publicKey={authSettings.pubkey}
						setVerifyModal={setVerifyModal}
					/>
				)}
				{isVerifyModal && (
					<VerifyModal
						title={
							isVerifyModal === 1
								? 'Disable Two-factor Authentication'
								: 'Unlock 2FA'
						}
						HandleCancel={setVerifyModal}
						isHandleDisable={isVerifyModal === 1}
						setInform={setInform}
						setError={setError}
					/>
				)}
				{isInform && (
					<Inform2FAModal
						isError={isError}
						HandleCancel={setInform}
						title={'Unlock 2FA'}
						type={'unlock'}
					/>
				)} */}
			</div>
		</>
	);
}
