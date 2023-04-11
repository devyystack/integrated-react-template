/** @format */

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch } from 'react-redux';
import { Divider } from '../../assets/icon/index.js';
import Button from './Button';
import styles from './SettingsModal.module.js';
import SetUp2FA from './SetUp2FA';
import CloseButton from '../../assets/img/close-button.png';
import getErrorMessages from '../../utils/getErrorMessages';
import { setErrorMessage, toggleModal } from '../../redux/slice/modalSlice';
import { setAuthSettings } from '../../redux/slice/authSlicer';

const SettingsModal = ({
	isSCReistered2FA,
	HandleCancel,
	__features,
	unlockDuration,
	handleDisable,
	handleEnable,
	publicKey,
	isUnlocked2FA,
	setVerifyModal,
}) => {
	const dispatch = useDispatch();
	const [radioState, setMainRadio] = useState(unlockDuration || false);
	const [features, setFeatures] = useState(__features);
	const handleClick = () => {
		if (isSCReistered2FA || unlockDuration > 0) return handleDisable();
		handleEnable();
	};

	const handleSaveSettings = async () => {
		try {
			if (isUnlocked2FA) {
				await dispatch(
					setAuthSettings({
						publicKey: publicKey,
						unlock_duration: radioState,
						features: features,
					})
				).unwrap();
			} else {
				dispatch(setErrorMessage('Unlock your 2FA first'));
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		}
	};

	const handleUnlock = () => {
		setVerifyModal(true);
	};

	return ReactDOM.createPortal(
		<React.Fragment>
			<div className={styles.wrapper} tabIndex={-1} role='dialog'>
				<div className={styles.container}>
					<input
						type='image'
						src={CloseButton}
						alt='close'
						className={styles.CloseButton}
						onClick={() => HandleCancel()}
					/>
					<section className={styles.header}>
						<div className={styles.title}>Two-Factor Authentication (2FA)</div>
						<Divider
							width='46.2rem'
							height='1.3rem'
							className={styles.divider}
						/>
					</section>
					<div className={styles.contentWrapper}>
						<div className={styles.authenticator}>
							<div className={styles.title}>Your authenticator</div>
							<Button
								color={(isSCReistered2FA || unlockDuration > 0) && 'red'}
								handleClick={handleClick}
								title={
									isSCReistered2FA || unlockDuration > 0 ? 'Disable' : 'Enable'
								}
							/>
						</div>
						<SetUp2FA
							__features={__features}
							radioState={radioState}
							setMainFeature={setFeatures}
							setMainRadio={setMainRadio}
							isUnlocked2FA={isUnlocked2FA}
						/>
					</div>
					<div className={styles.footer}>
						<Button
							title='Unlock'
							handleClick={handleUnlock}
							disabled={isSCReistered2FA !== true || isUnlocked2FA === true}
						/>

						<Button
							title='Save'
							handleClick={handleSaveSettings}
							disabled={isUnlocked2FA !== true}
						/>
					</div>
				</div>
				<div className='click-out-side' onClick={() => HandleCancel()} />
			</div>
		</React.Fragment>,
		document.body
	);
};

export default SettingsModal;
