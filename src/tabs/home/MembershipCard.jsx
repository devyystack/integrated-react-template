/** @format */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Button from '../../components/Button/Button';
import {
	cancelLoading,
	setBackgroundUpdate,
} from '../../redux/slice/GameSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { mbsClaim, getMbsTransaction } from '../../redux/slice/BadgeSlicer';

import { deleteFlash, setFlash } from '../../redux/slice/FlashSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
import CountDown from '../../common/CountDown/CountDown';
const mapTypeIcon = {
	Asteroid: './img/ASTEROID-type-icon.svg',
	Plasma: './img/PLASMA-type-icon.svg',
	Oxygen: './img/OXYGEN-type-icon.svg',
};
const serverIMG = 'https://ipfs.io/ipfs/';

export default function MembershipCard(props) {
	const dispatch = useDispatch();
	const [isCountDown, setCountdown] = useState('disabled');

	const isEnergy = props.userEnergy >= 100;

	const claimText = isEnergy
		? isCountDown === true
			? 'Claim'
			: 'Countdown'
		: 'No Energy';
	const isClaimable = claimText === 'Claim' || 'disabled';

	useEffect(() => {
		setCountdown(
			props.data?.next_availability * 1000 < Date.now() || 'disabled'
		);
		return () => {
			setCountdown(true);
		};
	}, [props.data.next_availability]);

	const HandleClaim = async () => {
		try {
			dispatch(cancelLoading(false));

			if (isClaimable !== 'disabled') {
				const resultAction = await dispatch(
					mbsClaim(props.data.asset_id)
				).unwrap();
				const flash_id = Date.now();
				try {
					if (resultAction?.transaction_id !== null) {
						const flashMessage = {
							id: flash_id,
							content: `Using your ${props.data.name} to get rewards`,
							timeout: 30000,
						};
						dispatch(setFlash(flashMessage));
						const response = await dispatch(
							getMbsTransaction(resultAction?.transaction_id)
						).unwrap();
						let bonus = response.bonus?.act?.data?.bonus_rewards.join(', ');
						let amount = response.amount?.act?.data?.data?.amounts.join(', ');
						if (response) {
							const inform =
								"You've just got " +
								amount +
								' Galaxy Coin.' +
								'Membership Bonus: ' +
								(bonus || 0);
							dispatch(setErrorMessage(inform));
							dispatch(toggleModal(true));
						}
						dispatch(deleteFlash(flash_id));
						dispatch(setBackgroundUpdate(true));
					}
				} catch (error) {
					dispatch(setErrorMessage('You got your rewards!'));
					dispatch(deleteFlash(flash_id));
					dispatch(setBackgroundUpdate(true));
				}
			} else {
				if (isCountDown === true)
					dispatch(setErrorMessage(`Don't push to hard! Try again later`));
				else
					dispatch(
						setErrorMessage(
							'Your membership card is under countdown. Try again later'
						)
					);
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			dispatch(setBackgroundUpdate(true));
			throw error;
		}
	};

	return (
		<div className='home__card-container'>
			<div className='card-section'>
				<div className='card-img'>
					<img
						src={serverIMG + props.data.img}
						alt='card'
						className='card-img--item'
					/>
				</div>
			</div>
			<div className='info-section'>
				<div className='info-text__section'>
					<div className='info-title'>
						<div
							className='info-type-icon'
							style={{
								backgroundImage: `url(${mapTypeIcon[props.data.type]})`,
							}}></div>
						<div className='info-title-name'>{props.data.name}</div>
					</div>
					<div className='info-content'>
						<div className='info-label'>
							EXTRA TOOL CAPACITY:
							<div className='info-description'>
								{props.data.additional_tools || 0}
							</div>
						</div>
						<div className='info-label'>
							EXTRA ENERGY CAPACITY:
							<div className='info-description'>
								{props.data.additional_energy || 0}
							</div>
						</div>
						<div className='info-label'>
							STORED MINING:
							<div className='info-description'>
								{props.data.saved_claims || 0}
							</div>
						</div>
						<div className='info-label'>
							REWARD RATE:
							<div className='info-description'>{props.data.rewards_rate}</div>
						</div>

						<div className='info-label'>
							Charge Time:
							<div className='info-description'>
								{props.data?.charged_time / 60 > 60
									? props.data?.charged_time / 60 / 60 + ' hours'
									: props.data?.charged_time / 60 + ' mins' || null}
							</div>
						</div>
					</div>
				</div>
				<div className='info-time'>
					<CountDown
						next_availability={props.data?.next_availability}
						handleFinish={setCountdown}
					/>
				</div>

				<div className='home-card-button__group'>
					<div className=' home-card-button--item'>
						<Button
							className='repair-btn'
							text={claimText}
							atr='semi-short'
							isDisabled={isClaimable}
							wrapperClassname='set-height'
							handleClick={HandleClaim}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
