/** @format */

import React, { useState } from 'react';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import SetUp2FA from './SetUp2FA';
import Input2FA from './Input2FA';
import Inform2FA from './Inform2FA';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useDispatch } from 'react-redux';
import CloseButton from '../../assets/img/close-button.png';

import ReactDOM from 'react-dom';
import Button from './Button';
import ProgressBar from './ProgressBar';
import { setAuthSettings, verifyOtp } from '../../redux/slice/authSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';

const RegisterModal = ({ HandleCancel, account }) => {
	const dispatch = useDispatch();
	const [otpCode, setOtpCode] = useState(null);
	const [isToggled, setToggled] = useState(false);
	const [stageIndex, setStage] = useState(0);
	const [unlockDuration, setUnlockDuration] = useState(0);
	const [features, setFeatures] = useState(0);
	const [isError, setIsError] = useState(false);
	const handleSwitch = async (idx) => {
		if (idx > 0) {
			switch (stageIndex) {
				case 2:
					try {
						if (otpCode?.length === 6) {
							const res = await dispatch(verifyOtp(otpCode)).unwrap();
							if (res.ok) {
								setStage(stageIndex + idx);
							} else {
								if (res.status) {
									getErrorMessages(res, dispatch, setErrorMessage, toggleModal);
								} else {
									dispatch(
										setErrorMessage(
											'Invalid OTP code. You should type it properly.'
										)
									);
									dispatch(toggleModal(true));
								}
							}
						} else {
							dispatch(
								setErrorMessage(
									'Invalid OTP code. You should type it properly.'
								)
							);
							dispatch(toggleModal(true));
						}
					} catch (error) {
						getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
					}
					break;
				case 3:
					setToggled(true);
					try {
						if (features > 0 && unlockDuration > 0) {
							let publicKey = '';
							if (account.publicKey?.length > 0) publicKey = account.publicKey;
							else if (account.pubkey?.length > 0) publicKey = account.pubkey;
							const res = await dispatch(
								setAuthSettings({
									publicKey: publicKey,
									unlock_duration: unlockDuration,
									features: features,
								})
							).unwrap();
							if (res.transaction_id || res.transaction?.processed.id) {
								setStage(stageIndex + idx);
								setToggled(false);
							}
						} else {
							dispatch(
								setErrorMessage(
									'Invalid settings. You should type it properly.'
								)
							);
							dispatch(toggleModal(true));
							setIsError(false);
						}
					} catch (error) {
						getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
						setIsError(true);
					}

					break;
				default:
					if (stageIndex + idx < 5 && stageIndex + idx >= 0)
						setStage(stageIndex + idx);
					break;
			}
		} else {
			if (stageIndex + idx < 5 && stageIndex + idx >= 0)
				setStage(stageIndex + idx);
		}
	};
	const renderStage = (stageIndex) => {
		switch (stageIndex) {
			case 0:
				return <Stage1 account={account} />;
			case 1:
				return <Stage2 account={account} />;
			case 2:
				return (
					<Input2FA type='enable' otpCode={otpCode} setMainOtp={setOtpCode} />
				);
			case 3:
				return (
					<SetUp2FA
						onNext={isToggled}
						setMainFeature={setFeatures}
						setMainRadio={setUnlockDuration}
						radioState={unlockDuration}
					/>
				);
			case 4:
				return <Inform2FA type='enabled' isError={isError} />;
			default:
				return <></>;
		}
	};
	return ReactDOM.createPortal(
		<React.Fragment>
			<div className='modal-wrapper' tabIndex={-1} role='dialog'>
				<div className='modal-authen'>
					<input
						type='image'
						src={CloseButton}
						alt='close'
						className='modal__close-btn'
						onClick={() => HandleCancel()}
					/>
					<div className='modal__stage-wrapper'>
						<section className='stage-progress'>
							<h4>Two-Factor Authentication (2FA)</h4>
							<ProgressBar
								currentStack={stageIndex + 1}
								maxStack={5}
								height={2}
								type={1}
							/>
						</section>
					</div>
					<div className='stage-content'>
						<SwitchTransition mode='out-in'>
							<CSSTransition
								key={stageIndex}
								addEndListener={(node, done) => {
									node.addEventListener('transitionend', done, false);
								}}
								classNames='fade'>
								<>{renderStage(stageIndex)}</>
							</CSSTransition>
						</SwitchTransition>
					</div>
					<div className='modal__button-group'>
						{stageIndex !== 4 ? (
							<Button
								title='Previous'
								color='red'
								handleClick={() => handleSwitch(-1)}
							/>
						) : (
							<Button title='Done' handleClick={() => HandleCancel()} />
						)}
						{stageIndex < 4 && (
							<Button title='Next' handleClick={() => handleSwitch(1)} />
						)}
					</div>
				</div>
			</div>
		</React.Fragment>,
		document.body
	);
};
export default RegisterModal;
