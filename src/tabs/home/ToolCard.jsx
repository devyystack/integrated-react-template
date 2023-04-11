/** @format */

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Button from '../../components/Button/Button';
import {
	mineItem,
	repairItem,
	repairCard,
	UpdateTimestamp,
	getTransaction,
} from '../../redux/slice/ToolsSlicer';
import {
	cancelLoading,
	setBackgroundUpdate,
} from '../../redux/slice/GameSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { updateRepairMoney } from '../../redux/slice/userSlicer';
import { useSpring, animated } from 'react-spring';

import { deleteFlash, setFlash } from '../../redux/slice/FlashSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
import CountDownTool from '../../common/CountDown/CountDownTool';
import useWindowSize from '../../utils/useWindowSIze';

import asteroidtypeicon from '../../static/icons/Asteroid.png';
import plasmatypeicon from '../../static/icons/Plasma.png';
import oxygentypeicon from '../../static/icons/Oxygen.png';

const mapTypeIcon = {
	Asteroid: asteroidtypeicon,
	Plasma: plasmatypeicon,
	Oxygen: oxygentypeicon,
};
const serverIMG = 'https://ipfs.io/ipfs/';


const min = (a, b) => {
	return a > b ? b : a;
};

export default function ToolCard(props) {
	const dispatch = useDispatch();

	const [store, setStore] = useState(0);

	const [storeStatus, setStoreStatus] = useState(false);

	const storeMiningMaximum = props.storeMining;

	const [isCountDown, setCountdown] = useState('disabled');

	const lost =
		parseFloat(props.data?.durability) -
		parseFloat(props.data?.current_durability);

	const isRepairable = lost !== 0 && lost / 10 <= props.plasma ? '' : 'disabled';

	const isDurable =
		props.data?.current_durability >= props.data?.durability_consumed * store;
	const isEnergy = props.userEnergy >= props.data?.energy_consumed * store;
	const mineText = isEnergy
		? isCountDown === true
			? isDurable
				? 'MINE'
				: 'WORN'
			: 'COUNTDOWN'
		: 'NO ENERGY';
	const isMinable = mineText === 'MINE' ? '' : 'disabled';
	// eslint-disable-next-line
	const [viewWidth, viewHeight] = useWindowSize();

	const dubral = useSpring({
		width:
			((props.data?.current_durability || 0) / (props.data?.durability || 1)) *
			min(viewWidth / 144, viewHeight / 90) *
			16.5,
		backgroundColor: '#660468',
		config: { duration: 1000 },
	});

	useEffect(() => {
		const storeMining = Math.floor(
			(Math.floor(Date.now()) / 1000 - props.data.next_availability) /
				props.data.charged_time
		);
		if (storeMining < 0) {
			setStore(0);
		} else {
			setStore(
				storeMining < storeMiningMaximum ? storeMining + 1 : storeMiningMaximum
			);
		}
		setCountdown(
			props.data?.next_availability * 1000 < Date.now() || 'disabled'
		);
		return () => {
			setCountdown(true);
			setStoreStatus(false);
		};
	}, [
		props.data.next_availability,
		isCountDown,
		storeStatus,
		props.data.charged_time,
		storeMiningMaximum,
	]);

	const HandleMine = async () => {
		try {
			dispatch(cancelLoading(false));

			if (isMinable !== 'disabled') {
				const flash_id = Date.now();
				const resultAction = await dispatch(
					mineItem({
						item_id: props.data.asset_id, 
						img: props.data.img
					})
				).unwrap();

				const flashMessage = {
					id: flash_id,
					content: `Using your ${props.data.template_name} to mine`,
					timeout: 30000,
				};
				dispatch(setFlash(flashMessage));

				try {
					if (resultAction?.transaction_id !== null) {
						dispatch(UpdateTimestamp());
						const response = await dispatch(
							getTransaction(resultAction?.transaction_id)
						).unwrap();
						let bonus =
							response.bonus?.act?.data?.bonus_rewards?.join(', ') || 0;
						let claim = response.claim?.act?.data?.rewards?.join(', ');
						if (response) {
							const inform =
								"You've just mined " +
								claim +
								' and Membership Bonus: ' +
								(bonus || 0);
							dispatch(setErrorMessage(inform));
							dispatch(toggleModal(true));
							dispatch(setBackgroundUpdate(true));
							dispatch(deleteFlash(flash_id));
						}
					}
				} catch (error) {
					dispatch(setErrorMessage('Your got your rewards!'));
					dispatch(deleteFlash(flash_id));
					dispatch(setBackgroundUpdate(true));
				}
			} else {
				if (isCountDown !== true)
					dispatch(
						setErrorMessage(`${props.data.template_name} is being used!`)
					);
				else if (
					props.data?.current_durability >= props.data?.durability_consumed
				)
					dispatch(
						setErrorMessage(
							`Your ${props.data.template_name} is too low to continue`
						)
					);
				else
					dispatch(
						setErrorMessage(
							"You don't have enough energy to mine use this tool."
						)
					);

				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			dispatch(setBackgroundUpdate(true));
		}
	};
	const HandleRepair = async () => {
		const flash_id = Date.now();
		try {
			dispatch(cancelLoading(false));
			if (isRepairable !== 'disabled') {
				const flashMessage = {
					id: flash_id,
					content: `Repairing your ${props.data.template_name}`,
					timeout: 5000,
				};
				dispatch(setFlash(flashMessage));
				const id = props.data.asset_id;
				const data = { id, lost };
				const resultAction = await dispatch(repairItem(data)).unwrap();
				if (resultAction?.transaction_id !== null) {
					dispatch(updateRepairMoney(parseFloat(lost / 10)));
					dispatch(repairCard(id));
				}
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(setBackgroundUpdate(true));
			dispatch(deleteFlash(flash_id));
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
						<div className='info-title-name'>{props.data.template_name}</div>
						{/* <div className='info-title-level'>  // updated by
							LV: {props.data.level || null}
							{store}/{storeMiningMaximum}
						</div> */}
					</div>
					<div className='info-content'>
						<div className='info-label'>
							Type:
							<div className='info-description'>
								{props.data.type}
							</div>
						</div>
						<div className='info-label'>
							Charge time:
							<div className='info-description'>
								{props.data?.charged_time / 60 > 60
									? props.data?.charged_time / 60 / 60 + ' hours'
									: props.data?.charged_time / 60 + ' min' || null}
							</div>
						</div>
						<div className='info-label'>
							Reward rate:
							<div className='info-description'>
								{props.data.reward}
							</div>
						</div>
						<div className='info-label'>
							Energy cost:
							<div className='info-description'>
								{props.data.energy_consumed || 0}
							</div>
						</div>
						<div className='info-label'>
							Durability cost:
							<div className='info-description'>
								{props.data.durability_consumed || null}
							</div>
						</div>

						{/* <div className='info-label'>
							Uniqueness:
							<div className='info-description'>
								{props.data.rarity || null}
							</div>
						</div> */}
					</div>
				</div>
				<div className='info-time'>
					<CountDownTool
						next_availability={
							props.data.next_availability +
							props.data.charged_time * (store < storeMiningMaximum && store)
						}
						handleFinish={setCountdown}
						charged_time={props.data.charged_time}
						storeMiningMaximum={storeMiningMaximum}
						handleStoreMining={setStoreStatus}
					/>
				</div>
				<div className='fill'>
					{/* <animated.div className='fill' style={dubral} /> // updated by */}
					<animated.div className='content' style={{backgroundColor: props.data.durability == props.data.current_durability ? '#8a3983' : null}}>
						{props.data.current_durability || 0} / {props.data.durability || 0}
					</animated.div>
				</div>
				<div className='home-card-button__group'>
					<div className='tooltip home-card-button--item mine-btn'>
						<Button
							// className='repair-btn'
							text={mineText}
							atr='semi-short'
							isDisabled={isMinable}
							wrapperClassname='set-height'
							handleClick={HandleMine}
						/>
						{!isDurable && (
							<span className='tooltiptext tooltip-bottom'>
								<i className='arrow-up'></i>Need{' '}
								{props?.data.durability_consumed * store -
									props?.data.current_durability}{' '}
								durability consumed to mine.{' '}
							</span>
						)}
						{!isEnergy && (
							<span className='tooltiptext tooltip-bottom'>
								<i className='arrow-up'></i>Need{' '}
								{props.data.energy_consumed * store - props.userEnergy} energy
								to mine.{' '}
							</span>
						)}
					</div>
					<div className='tooltip home-card-button--item repair-btn'>
						<Button
							// className='repair-btn'
							text='REPAIR'
							atr='semi-short'
							isDisabled={isRepairable}
							wrapperClassname='set-height'
							handleClick={HandleRepair}
						/>
						{isRepairable !== 'disabled' && (
							<span className='tooltiptext tooltip-bottom'>
								<i className='arrow-up'></i>{lost / 10} Plasma to repair
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
