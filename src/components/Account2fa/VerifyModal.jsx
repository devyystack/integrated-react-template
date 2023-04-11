/** @format */

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Divider } from '../../assets/icon/index.js';
import Button from './Button';
import styles from './VerifyModal.module.js';
import CloseButton from '../../assets/img/close-button.png';
import Input2FA from './Input2FA';
import {
	verifyOtp,
	disable2FA,
	removeAuthSettings,
	isValidbackupKey,
} from '../../redux/slice/authSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
import { setErrorMessage, toggleModal } from '../../redux/slice/modalSlice';
import { setBackgroundUpdate } from '../../redux/slice/GameSlicer';
import InputPrivateKey from './InputPrivateKey';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import cx from 'classnames';
/**
 *
 * @param {*} HandleCancel
 * @param {*} title
 * @param {*} isHandleDisable
 * @param {*} setInform
 * @param {*} setError
 * @returns
 */
const VerifyModal = ({
	HandleCancel,
	title,
	isHandleDisable,
	setInform,
	setError,
}) => {
	const [otpCode, setMainOtp] = useState('');
	const [priavteKey, setPrivateKey] = useState('');
	const [tabIndex, setTabIndex] = useState(0);
	const authSettings = useSelector((state) => state.auth.authSettings);
	const dispatch = useDispatch();
	// const authSettings = useSelector((state) => state.auth.authSettings);
	// const authFlag = useSelector((state) => state.auth.authFlag);
	const handleSubmit = async () => {
		if (tabIndex === 1) {
			await handlePrivatekey();
		} else if (tabIndex === 0 && otpCode.length === 6) {
			await handleOtp();
		} else {
			dispatch(setErrorMessage('Invalid Otp code. Try again later'));
			dispatch(toggleModal(true));
		}
	};
	const handlePrivatekey = async () => {
		try {
			dispatch(isValidbackupKey(priavteKey));

			if (isHandleDisable) {
				if (!!authSettings.features) {
					await dispatch(removeAuthSettings()).unwrap();
				} else if (!!authSettings.unlockDuration) {
					await dispatch(disable2FA()).unwrap();
				}
			}
			setError(false);
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			setBackgroundUpdate(true);
			setError(true);
		}
		HandleCancel();

		setInform(true);
	};
	const handleOtp = async () => {
		try {
			const res = await dispatch(verifyOtp(otpCode)).unwrap();
			if (res.ok) {
				if (isHandleDisable) {
					if (!!authSettings.features) {
						const response = await dispatch(removeAuthSettings()).unwrap();
						if (!!response.transaction_id || !!response.processed)
							await dispatch(disable2FA()).unwrap();
					} else if (!!authSettings.unlockDuration) {
						await dispatch(disable2FA()).unwrap();
					}
				}
				setError(false);
			} else {
				if (res.status) {
					getErrorMessages(res, dispatch, setErrorMessage, toggleModal);
				}
				setError(true);
			}
			setInform(true);
			HandleCancel();
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			setBackgroundUpdate(true);
		}
	};
	const renderTab = (tabIndex) => {
		switch (tabIndex) {
			case 0:
				return <Input2FA setMainOtp={setMainOtp} otpCode={otpCode} />;

			default:
				return (
					<InputPrivateKey
						setPrivateKey={setPrivateKey}
						priavteKey={priavteKey}
					/>
				);
		}
	};
	return ReactDOM.createPortal(
		<React.Fragment>
			<div className={styles.wrapper} tabIndex={-1} role='dialog'>
				<div className={styles.container}>
					<input
						type='image'
						src={CloseButton}
						alt='close'
						onClick={() => HandleCancel()}
						className={styles.CloseButton}
					/>
					<section className={styles.header}>
						<div className={styles.title}>{title}</div>
						<Divider
							width='46.2rem'
							height='1.3rem'
							className={styles.divider}
						/>
					</section>
					<section className={styles.nav}>
						<button
							onClick={() => setTabIndex(0)}
							className={[
								cx(styles.navButton, {
									[styles.selected]: tabIndex === 0,
								}),
							].join(' ')}>
							OTP code
						</button>
						<button
							onClick={() => setTabIndex(1)}
							className={[
								cx(styles.navButton, {
									[styles.selected]: tabIndex === 1,
								}),
							].join(' ')}>
							Private Key
						</button>
					</section>
					<div className={styles.contentWrapper}>
						<SwitchTransition mode='out-in'>
							<CSSTransition
								key={tabIndex}
								addEndListener={(node, done) => {
									node.addEventListener('transitionend', done, false);
								}}
								classNames='fade'>
								<>{renderTab(tabIndex)}</>
							</CSSTransition>
						</SwitchTransition>
					</div>

					<div className={styles.footer}>
						<Button title='Confirm' color='red' handleClick={handleSubmit} />
					</div>
				</div>
			</div>
		</React.Fragment>,
		document.body
	);
};

export default VerifyModal;
