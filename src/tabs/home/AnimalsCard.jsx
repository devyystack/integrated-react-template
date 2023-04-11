/** @format */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../../components/Button/Button';
import {
	cancelLoading,
	setBackgroundUpdate,
} from '../../redux/slice/GameSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { useSpring, animated } from 'react-spring';

import { deleteFlash, setFlash } from '../../redux/slice/FlashSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
import CountDown from '../../common/CountDown/CountDown';
import {
	feedAnimal,
	careAnimal,
	getTransaction,
	UpdateTimestamp,
} from '../../redux/slice/AnimalsSlicer';
import { getOxygenName } from '../../redux/slice/OxygensSlicer';
import { getChestAssetsByTemplate } from '../../redux/slice/AtomicSlicer';
import RemoveBuildsModal from '../../components/Modal/RemoveBuildsModal';
import { UpdateHealth } from '../../redux/slice/userSlicer';
import useWindowSize from '../../utils/useWindowSIze';

const serverIMG = 'https://ipfs.io/ipfs/';
const min = (a, b) => {
	return a > b ? b : a;
};
function filterDailyClaim(item) {
	if (item + 86400 > Date.now() / 1000) {
		return true;
	}
	return false;
}

export default function AnimalsCard(props) {
	const dispatch = useDispatch();
	const isEnergy = props.userEnergy >= props.data?.energy_consumed;
	// consumed_card
	const [isCountDown, setCountdown] = useState('disabled');
	const [dayClaim, setDayClaim] = useState(
		props.data?.day_claims_at.filter(filterDailyClaim) || []
	);
	const [modalShowing, setModalShowing] = useState(false);

	const [timeClaimLimit, setTimeClaimLimit] = useState(0);
	const calfOxygen = useSelector((state) =>
		getChestAssetsByTemplate(state.atomic.oxygens, '318606')
	);

	// 318606
	const isBabyEvolve =
		(props.data.required_claims === props.data.times_claimed &&
			calfOxygen?.length > 0) ||
		(!props.data.name.includes('Baby Calf') &&
			!props.data.name.includes('Egg'));
	const oxygenList = useSelector((state) =>
		getChestAssetsByTemplate(state.atomic.oxygens, props.data.consumed_card + '')
	);

	const reward = useSelector((state) =>
		getOxygenName(state.oxygens, props.data.reward_card)
	);
	const isOxygen =
		(oxygenList && oxygenList.length > 0) ||
		((props.data.name.includes('Baby Calf') ||
			props.data.name.includes('Egg')) &&
			isBabyEvolve);
	const isEvolve = props.data?.required_claims === props.data?.times_claimed;
	const actionName = props.data?.name?.includes('Egg') ? 'Hatch' : 'Feed';
	const feedText =
		isCountDown === true
			? isOxygen || props.data.consumed_card < 1
				? isEnergy
					? isEvolve
						? isBabyEvolve
							? 'Evolve'
							: 'No Barley'
						: actionName
					: 'No Energy'
				: 'No Oxygen'
			: 'Countdown';
	const idFeedable =
		(Date.now() - timeClaimLimit * 1000 >= 0 && feedText === actionName) ||
		feedText === 'Evolve'
			? ''
			: 'disabled';

	const isEnergyRemove = props.userEnergy >= 200;
	const removeText = isEnergyRemove ? 'Remove' : 'No Energy';
	const isRemovalbe =
		(removeText === 'Remove' && isCountDown === true) || 'disabled';
	// eslint-disable-next-line
	const [viewWidth, viewHeight] = useWindowSize();

	const dubral = useSpring({
		width:
			((props.data?.times_claimed || 0) / (props.data?.required_claims || 1)) *
			min(viewWidth / 144, viewHeight / 90) *
			16.5,
		backgroundColor: '#B06A38',
		config: { duration: 1000 },
	});
	useEffect(() => {
		if (dayClaim.length === props.data?.daily_claim_limit) {
			setTimeClaimLimit(dayClaim[0] + 86400);
		} else {
			setTimeClaimLimit(0);
		}
		setCountdown(
			Date.now() - props.data?.next_availability * 1000 >= 0 || 'disabled'
		);

		return () => {
			setCountdown(true);
		};
	}, [props.data.next_availability, props.data?.daily_claim_limit, dayClaim]);

	useEffect(() => {
		setDayClaim(props.data?.day_claims_at.filter(filterDailyClaim));
	}, [props.data?.day_claims_at]);

	const HandleFeed = async () => {
		const flash_id = Date.now();
		dispatch(cancelLoading(false));
		const flashMessage = {
			id: flash_id,
			content: `${actionName}ing your ${props.data.name}`,
			timeout: 30000,
		};
		const animal = props.data.asset_id;

		try {
			let resultAction = {};
			if (idFeedable !== 'disabled') {
				dispatch(setFlash(flashMessage));

				if (props.data.consumed_card > 0) {
					if (isBabyEvolve)
						if (props.data.name.includes('Calf (Male)') && isEvolve) {
							resultAction = await dispatch(careAnimal(animal)).unwrap();
						} else {
							resultAction = await dispatch(
								feedAnimal({ animal: animal, oxygen: calfOxygen })
							).unwrap();
						}
					else {
						resultAction = await dispatch(
							feedAnimal({ animal: animal, oxygen: oxygenList })
						).unwrap();
					}
				} else {
					if (isBabyEvolve)
						resultAction = await dispatch(
							feedAnimal({ animal: animal, oxygen: calfOxygen })
						).unwrap();
					else resultAction = await dispatch(careAnimal(animal)).unwrap();
				}
				if (resultAction?.transaction_id !== null) {
					dispatch(UpdateTimestamp(animal));
					dispatch(UpdateHealth(props.data.energy_consumed));
					const flashMessage2 = {
						id: flash_id,
						content: `${actionName}ing your ${props.data.name} successfully`,
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage2));
					if (
						props.data.times_claimed + 1 >= props.data.required_claims &&
						props.data.reward_card
					) {
						const result = await dispatch(
							getTransaction(resultAction.transaction_id)
						).unwrap();
						if (result.claim) {
							const inform =
								"You've just harvested " +
								result.claim.quantity +
								' ' +
								reward.name;
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
			dispatch(deleteFlash(flash_id));
			dispatch(setBackgroundUpdate(true));
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
					asset_id={props.data.asset_id}
					name={props.data.name}
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
								backgroundImage: `url(/img/livestock-icon.svg)`,
							}}></div>
						<div className='info-title-name'>{props.data?.name}</div>
						{props.data?.daily_claim_limit &&
							props.data?.daily_claim_limit > 0 && (
								<div className='info-title-level tooltip'>
									{dayClaim.length || 0}/{props.data?.daily_claim_limit}
									{props.data?.day_claims_at.length ===
										props.data?.daily_claim_limit && (
										<span className='tooltiptext tooltip-bottom'>
											<CountDown
												next_availability={timeClaimLimit}
												handleFinish={setCountdown}
											/>
										</span>
									)}
								</div>
							)}
					</div>
					<div className='info-content'>
						<div className='info-label'>
							Reward:
							<div className='info-description'>{reward?.name || 'None'}</div>
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
							Daily Claim Limit
							<div className='info-description'>
								{props.data?.daily_claim_limit || 0}
							</div>
						</div>
						<div className='info-label'>
							Required {actionName}
							<div className='info-description'>
								{props.data?.required_claims || 0}
							</div>
						</div>
						<div className='info-label'>
							Energy Consumed:
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
					{props.data?.required_claims > 0 && (
						<div className='tooltip home-card-button--item'>
							<Button
								className='repair-btn'
								text={feedText}
								atr='semi-short'
								isDisabled={idFeedable}
								wrapperClassname='set-height'
								handleClick={HandleFeed}
							/>
							{!isEnergy && (
								<span className='tooltiptext tooltip-bottom'>
									<i className='arrow-up'></i>Need {props.data?.energy_consumed}{' '}
									energy to {actionName}
								</span>
							)}
						</div>
					)}
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
								energy to feed{' '}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
