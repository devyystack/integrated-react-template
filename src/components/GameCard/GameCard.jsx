/** @format */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../Button/Button';
import {
	removeItem,
	repairItem,
	useItem,
	repairCard,
} from '../../redux/slice/ToolsSlicer';
import { openPack } from '../../redux/slice/PackSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { exchangeRewards, getTransaction } from '../../redux/slice/OxygensSlicer';
import {
	cancelLoading,
	setBackgroundUpdate,
	setUpdate,
} from '../../redux/slice/GameSlicer';
import { mbsUnstake } from '../../redux/slice/BadgeSlicer';
import { getPlayerInfo, updateRepairMoney, selectUserInfo } from '../../redux/slice/userSlicer';
import { setFlash } from '../../redux/slice/FlashSlicer';
import CountDown from '../../common/CountDown/CountDown';
import getErrorMessages from '../../utils/getErrorMessages';
import { popAsset, getRefund } from '../../redux/slice/AtomicSlicer';

const serverIMG = 'https://ipfs.io/ipfs/';  
const netURL = 'https://neftyblocks.com/c/galaxyminers/packs';


export default function GameCard({ card, key44, plasma, canBurn, handleChoose }) {
	const dispatch = useDispatch();
	const lost =
	parseInt(card.durability || 0) - parseInt(card.current_durability || 0);
	const isRepairable = lost !== 0 && lost <= plasma * 5 ? true : 'disabled';
	const [isUnstake, setIsUnstake] = useState('disabled');

	const userInfo = useSelector(selectUserInfo);

	const isCountdown = card.next_availability < Date.now() / 1000 || 'disabled';
	const isRemovable =
		isUnstake !== 'disabled' &&
		isCountdown !== 'disabled' &&
		isRepairable !== true &&
		userInfo.energy >= 500
			? true
			: 'disabled';
	useEffect(() => {
		setIsUnstake(
			card.unstaking_time ||
				card.next_availability < Date.now() / 1000 ||
				'disabled'
		);
		return () => {
			setIsUnstake('disabled');
		};
	}, [card.unstaking_time, card.next_availability]);

	const HandleRepair = async () => {
		try {
			dispatch(cancelLoading(false));

			if (isRepairable !== 'disabled') {
				const id = card.asset_id;
				const data = { id, lost };
				const resultAction = await dispatch(repairItem(data)).unwrap();
				if (resultAction?.transaction_id !== null) {
					const flash_id = Date.now();
					const flashMessage = {
						id: flash_id,
						content: `Restoring your ${card.template_name}`,
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage));
					dispatch(updateRepairMoney(parseFloat(lost / 5)));
					dispatch(repairCard(card.asset_id));
					dispatch(setBackgroundUpdate(true));
				}
			} else {
				if (lost / 5 <= plasma)
					dispatch(setErrorMessage('This tool is full Durability!'));
				else
					dispatch(setErrorMessage(`We need ${lost / 5} plasmas to restore.`));
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			dispatch(setBackgroundUpdate(true));
		}
	};
	const HandleExchange = async () => {
		try {
			dispatch(cancelLoading(false));
			const resultAction = await dispatch(
				exchangeRewards(card.idList[0])
			).unwrap();
			dispatch(popAsset(card));
			const flash_id = Date.now();
			const flashMessage = {
				id: flash_id,
				content: `Exchanging your  ${card.name}`,
				timeout: 5000,
			};
			dispatch(setFlash(flashMessage));
			if (resultAction.transaction_id) {
				const result = await dispatch(
					getTransaction(resultAction.transaction_id)
				).unwrap();
				if (result.burn.length > 0) {
					const inform = "You've just got " + result.burn.join(', ');
					dispatch(setErrorMessage(inform));
				} else {
					dispatch(
						setErrorMessage('You dont get anythings. Better Luck next time!')
					);
				}
				dispatch(toggleModal(true));

				dispatch(getPlayerInfo()).unwrap();
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			dispatch(setBackgroundUpdate(true));
		}
	};
	const HandleWear = async () => {
		try {
			dispatch(cancelLoading(false));
			const resultAction = await dispatch(
				useItem({
					asset_id: card.idList[0],
					// added by
					Type: card.data.Type,
					template_id: card.template.template_id,
					// end
				})
			).unwrap();
			dispatch(popAsset(card));
			if (resultAction?.transaction_id) {
				const flash_id = Date.now();
				const flashMessage = {
					id: flash_id,
					content: `Equipping your ${card.data.name || card.data.template_name}`,
					timeout: 5000,
				};
				dispatch(setFlash(flashMessage));
			}
			dispatch(setUpdate(true));
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			dispatch(setUpdate(true));
			throw error;
		}
	};
	const HandleRefund = async () => {
		try {
			dispatch(cancelLoading(false));
			const resultAction = await dispatch(getRefund()).unwrap();
			const flash_id = Date.now();
			const flashMessage = {
				id: flash_id,
				content: `Refunding your ${card.data.name || card.data.template_name}`,
				timeout: 5000,
			};
			dispatch(setFlash(flashMessage));
			if (resultAction?.transaction_id) {
				dispatch(
					setErrorMessage(
						'You have been refunded successfully. Thank you for your help.'
					)
				);
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(setUpdate(true));
		}
	};
	const HandleRemove = async () => {
		try {
			dispatch(cancelLoading(false));

			if (isRemovable !== 'disabled') {
				let resultAction = {};
				if (card.name)
					resultAction = await dispatch(mbsUnstake(card.asset_id)).unwrap();
				else resultAction = await dispatch(removeItem(card.asset_id)).unwrap();
				if (resultAction?.transaction_id !== null) {
					const flash_id = Date.now();
					const flashMessage = {
						id: flash_id,
						content: 'Detaching your gadget',
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage));
					dispatch(setUpdate(true));
				}
			} else {
				if (userInfo.energy < 500) {
					dispatch(setErrorMessage(`You should have 500+ energy to unstake this tool.`));
				}
				else if (isRepairable !== 'disabled')
					dispatch(setErrorMessage(`You must restore your gadget first`));
				else
					dispatch(
						setErrorMessage(`Can not detach this gadget due to countdown.`)
					);
				dispatch(toggleModal(true));
			}
		} catch (error) {
			dispatch(setUpdate(true));
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		}
	};

	const handleOpen = async () => {
		try {
			if (card.asset_id !== undefined) {
				dispatch(cancelLoading(false));
				const resultAction = await dispatch(openPack({item_id: card.idList[0], name: card.name})).unwrap();
				if (resultAction?.transaction_id !== null) {
					dispatch(popAsset(card));
					const flash_id = Date.now();
					const flashMessage = {
						id: flash_id,
						content: 'You will get game resources in a few seconds.',
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage));
					// let receivedOpenedPack = 0;  // updated by
					// resultAction?.processed.action_traces.forEach((action) => {
					// 	action.inline_traces.forEach((inline_trace) => {
					// 		receivedOpenedPack = inline_trace.act.data?.points?.join(' and ');
					// 	});
					// });
					// dispatch(
					// 	setErrorMessage(`You are about to get ` + receivedOpenedPack)
					// );
					// dispatch(toggleModal(true));
					// dispatch(setBackgroundUpdate(true));
				}
			} else {
				dispatch(setErrorMessage('Please try again later'));
				dispatch(toggleModal(true));
				dispatch(setBackgroundUpdate(true));
			}
			dispatch(setUpdate(true));
		} catch (error) {
			dispatch(setBackgroundUpdate(true));
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		}
	};
	const HandleOpenNefty = () => {
		window.open(netURL, '_blank').focus();
		dispatch(setErrorMessage('Only Token Pack can be opened in game!'));
		dispatch(toggleModal(true));
	};
	//
	return (
		<div className='card-container'>
			<div className='card-wrapper'>
				{(card.data?.img || card.img) && (
					<img
						src={serverIMG + (card?.data?.img || card?.img)}
						alt={card.data?.name || card.template_name}
						className='card-container__image'
						width='135'
						height='190'
						onClick={() => handleChoose ? handleChoose(key44) : null}
					/>
				)}
			</div>

			{/* {card?.total && (
				<div className={'card-container--amount coin'}>
					{card?.total} {card.data?.name}
				</div>
			)} */}
			{card?.unstaking_time && (
				<CountDown
					next_availability={card.unstaking_time}
					handleFinish={setIsUnstake}
				/>
			)}
			{/* {card?.current_durability >= 0 && (
				<div className='card-container--number'>
					{card?.durability}({card?.durability - card?.current_durability})
				</div>
			)} */}

			<div className='card-group__button'>
				{/* {card?.current_durability >= 0 && (
					<Button
						text='Restore'
						isDisabled={isRepairable}
						handleClick={HandleRepair}
						atr='short small'
					/>
				)} */}

				{card?.charged_time >= 0 && plasma != 'null' && ( // updated by    original: card?.charged_time >= 0 && plasma != null
					<Button
						text='UNSTAKE'
						isDisabled={isRemovable}
						handleClick={HandleRemove}
						atr='short'
					/>
				)}

				{card?.charged_time >= 0 && plasma == 'null' && (
					<button
						className={`button-section `}
						style={{visibility: 'hidden'}}>
						<div className={`plain-button ` + 'short'}>
						</div>
					</button>
				)}

				{card.isOpenable && (
					<Button text={'OPEN'} handleClick={handleOpen} atr='short' />
				)}
				{card.isOpenLink && (
					<Button
						text={'Nefty'}
						handleClick={HandleOpenNefty}
						atr='long small'
					/>
				)}
				{card.isRefundable && (
					<Button text={'Refund'} handleClick={HandleRefund} atr='long small' />
				)}
				{card.isWearable && (
					<Button text={'STAKE(' + card?.total + ')'} handleClick={HandleWear} atr='short' />
				)}
				{canBurn?.includes(card.template?.template_id) && (
					<Button
						text='Exchange'
						handleClick={HandleExchange}
						atr='short small'
					/>
				)}
			</div>
		</div>
	);
}
