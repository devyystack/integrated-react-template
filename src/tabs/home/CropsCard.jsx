/** @format */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../../components/Button/Button';
import {
	UpdateTimestamp,
	getTransaction,
} from '../../redux/slice/PlantsSlicer';
import { cropClaim } from '../../redux/slice/PlantsSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { useSpring, animated } from 'react-spring';
import CountDown from '../../common/CountDown/CountDown';
import { deleteFlash, setFlash } from '../../redux/slice/FlashSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
import { getOxygenName } from '../../redux/slice/OxygensSlicer';
import {
	cancelLoading,
	setBackgroundUpdate,
} from '../../redux/slice/GameSlicer';
import RemoveBuildsModal from '../../components/Modal/RemoveBuildsModal';

import useWindowSize from '../../utils/useWindowSIze';
import { UpdateHealth } from '../../redux/slice/userSlicer';
const serverIMG = 'https://ipfs.io/ipfs/';
const min = (a, b) => {
	return a > b ? b : a;
};
export default function CropsCard(props) {
	const dispatch = useDispatch();
	const [isCountDown, setCountdown] = useState('disabled');
	const [modalShowing, setModalShowing] = useState(false);

	const isEnergy = props.userEnergy >= props.data?.energy_consumed;
	const isClaimable = (isEnergy && isCountDown === true) || 'disabled';
	const reward = useSelector((state) =>
		getOxygenName(state.oxygens, props.data.reward_card)
	);
	const claimText =
		isCountDown === true ? (isEnergy ? 'Water' : 'No Energy') : 'CountDown';

	const isEnergyRemove = props.userEnergy >= 200;
	const removeText = isEnergyRemove ? 'Remove' : 'No Energy';
	const isRemovalbe =
		(removeText === 'Remove' && isCountDown === true) || 'disabled';

	const miss = parseInt(
		(Date.now() / 1000 - props.data.next_availability) /
			(props.data.miss_claim_limit * props.data.charge_time)
	);
	// eslint-disable-next-line
	const [viewWidth, viewHeight] = useWindowSize();
	useEffect(() => {
		setCountdown(
			props.data?.next_availability * 1000 < Date.now() || 'disabled'
		);
		return () => {
			setCountdown(true);
		};
	}, [props.data.next_availability]);
	const dubral = useSpring({
		width:
			((props.data?.times_claimed || 0) / (props.data?.required_claims || 1)) *
			min(viewWidth / 144, viewHeight / 90) *
			16.5,
		backgroundColor: '#B06A38',
		config: { duration: 1000 },
	});
	const HandleCropClaim = async () => {
		const flash_id = Date.now();
		try {
			dispatch(cancelLoading(false));

			if (isClaimable !== 'disabled') {
				const flashMessage = {
					id: flash_id,
					content: `Watering your ${props.data.name}.`,
					timeout: 30000,
				};
				dispatch(setFlash(flashMessage));
				const resultAction = await dispatch(
					cropClaim(props.data.asset_id)
				).unwrap();
				if (resultAction.transaction_id) {
					dispatch(UpdateTimestamp(props.data.asset_id));
					dispatch(UpdateHealth(props.data.energy_consumed));
					const flashMessage2 = {
						id: flash_id,
						content: `Watering your ${props.data.name} successfully`,
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage2));
					if (
						props.data.times_claimed + 1 - miss >=
						props.data.required_claims
					) {
						const result = await dispatch(
							getTransaction(resultAction.transaction_id)
						).unwrap();
						if (result.claim) {
							const inform =
								`You've just harvested ${result.claim.quantity} ${reward.name}`;
							dispatch(setErrorMessage(inform));
						} else {
							dispatch(setErrorMessage('You got your rewards'));
						}
						dispatch(toggleModal(true));
					}
				}
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(setBackgroundUpdate(true));
			dispatch(deleteFlash(flash_id));
		}
	};
	const HandleRemove = () => {
		setModalShowing(true);
	};
	return (
		<div className='home__card-container'>
			{modalShowing === true && (
				<RemoveBuildsModal
					HandleCancel={() => setModalShowing(false)}
					name={props.data.name}
					asset_id={props.data.asset_id}
				/>
			)}
			<div className='card-section'>
				<div className='card-img'>
					{props.data?.img && (
						<img
							src={serverIMG + props.data?.img}
							alt='card'
							className='card-img--item'
						/>
					)}
				</div>

				<div className='card-number'>
					<animated.div className='fill' style={dubral} />
					<animated.div className='content'>
						{props.data?.times_claimed || 0}/ {props.data?.required_claims || 0}
					</animated.div>
				</div>
			</div>
			<div className='info-section'>
				<div className='info-text__section'>
					<div className='info-title'>
						<div
							className='info-type-icon'
							style={{
								backgroundImage: `url(/img/crop-icon.svg)`,
							}}></div>
						<div className='info-title-name'>{props.data?.name}</div>
						<div className='info-title-level'>Missed: {miss || 0}</div>
					</div>
					<div className='info-content'>
						{props.data?.rarity && (
							<div className='info-label'>
								Rarity:
								<div className='info-description'>
									{props.data?.rarity || null}
								</div>
							</div>
						)}

						<div className='info-label'>
							Reward
							<div className='info-description'>{reward.name}</div>
						</div>

						<div className='info-label'>
							Charge Time:
							<div className='info-description'>
								{props.data?.charge_time / 60 > 60
									? (props.data?.charge_time / 3600).toFixed(2) + ' hours'
									: (props.data?.charge_time / 60).toFixed(2) + ' mins' || null}
							</div>
						</div>
						<div className='info-label'>
							Miss Claim Limit
							<div className='info-description'>
								{props.data?.miss_claim_limit || 0}
							</div>
						</div>
						<div className='info-label'>
							Required Claim
							<div className='info-description'>
								{props.data?.required_claims || 0}
							</div>
						</div>
						<div className='info-label'>
							Consumed Energy:
							<div className='info-description'>
								{props.data?.energy_consumed || 0}
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
					<div className='tooltip home-card-button--item'>
						<Button
							className='repair-btn'
							text={claimText}
							atr='semi-short'
							isDisabled={isClaimable}
							wrapperClassname='set-height'
							handleClick={HandleCropClaim}
						/>
						{!isEnergy && (
							<span className='tooltiptext tooltip-bottom'>
								<i className='arrow-up'></i>Need {props.data?.energy_consumed}{' '}
								energy to mine{' '}
							</span>
						)}
					</div>
					<div className='tooltip home-card-button--item'>
						<Button
							className='repair-btn'
							text={removeText}
							atr='semi-short'
							isDisabled={isRemovalbe}
							wrapperClassname='set-height'
							handleClick={HandleRemove}
						/>
						{!isEnergy && (
							<span className='tooltiptext tooltip-bottom'>
								<i className='arrow-up'></i>Need {props.data?.energy_consumed}{' '}
								energy to mine{' '}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
