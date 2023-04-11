/** @format */

import React, { useState } from 'react';
// import './index.scss';
import Card from './card';
import CardList from '../../components/CardList/CardList';
import Button from '../../components/Button/Button';

import { useDispatch, useSelector } from 'react-redux';
import { craftTool } from '../../redux/slice/ToolsSlicer';
import {
	cancelLoading,
	setBackgroundUpdate,
} from '../../redux/slice/GameSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { deleteFlash, setFlash } from '../../redux/slice/FlashSlicer';
import {
	mbsCraft,
	getMbsCraftTransaction,
	mbsClaimAsset,
} from '../../redux/slice/BadgeSlicer';
import { craftBuilding } from '../../redux/slice/BuildingSlicer';
import asteroidtypeicon from '../../static/icons/Asteroid.png';
import plasmatypeicon from '../../static/icons/Plasma.png';
import oxygentypeicon from '../../static/icons/Oxygen.png';
import getErrorMessages from '../../utils/getErrorMessages';
import TicketInput from './TicketInput';

import GameCard from '../../components/GameCard/GameCard';

const resourceIconMapping = {
	Asteroid: asteroidtypeicon,
	Plasma: plasmatypeicon,
	Oxygen: oxygentypeicon,
};

export default function Smithy() {
	const [selectedCardIndex, setSetlectedCardIndex] = useState(0);
	const [ticket, setTicket] = useState(0);

	const EquipConfigs = useSelector((state) => state.tools.EquipConfigs);
	const buildConfig = useSelector((state) => state.builds.buildConfig);
	const badgeCraft = useSelector((state) => state.badge.badgeCraft);

	let crafts = EquipConfigs;

	// arrange items accourding to type and Rarity
	const arranged_crafts = [];
	const types = ['Oxygen', 'Asteroid', 'Plasma'];
	const rarities = ['Common', 'Uncommon', 'Rare', 'Epic'];

	types.map( type => {
		rarities.map(rarity => {
			const found = crafts.findIndex(each => each.type == type && each.rarity == rarity);
			if (found > -1) {
				arranged_crafts.push(crafts[found]);
			}
		})
	})

	crafts = arranged_crafts.concat(badgeCraft);

	const balances = useSelector((state) => state.user.balances);
	const totalCoin = useSelector((state) => state.coin.totalCoin);
	const coinsId = useSelector((state) => state.coin.coinsId);
	const ticketsChest = useSelector((state) => state.atomic.tickets);
	const craft = crafts[selectedCardIndex];
	const dispatch = useDispatch();

	const isCraftable =
		(balances?.asteroi >= craft?.asteroid_mint || totalCoin >= craft?.coins_mint) &&
		balances?.plasma >= (craft?.plasma_mint || craft?.plasmas_mint)
			? null
			: 'disabled';

	const HandleCraft = () => {
		if (craft.num_slots) {
			HandleBuildingCraft();
		} else if (craft.saved_claims) {
			HandleMbsCraft();
		} else {
			HandleToolCraft();
		}
	};

	const HandleToolCraft = async () => {
		try {
			dispatch(cancelLoading(false));
			if (isCraftable === null) {
				const resultAction = await dispatch(
					craftTool({ craft: craft, ticket: ticket })
				).unwrap();
				if (resultAction?.transaction_id !== null) {
					const flash_id = Date.now();
					const flashMessage = {
						id: flash_id,
						content: `${craft.template_name} is on the way sir!`,
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage));
					// const { claim } = await dispatch(
					// 	getCraftTransaction(resultAction?.transaction_id)
					// ).unwrap();
					// if (claim) {
					// with discount: ${claim.discount}%
					const inform = `You have craft ${craft.template_name} successfully `;
					dispatch(setErrorMessage(inform));
					dispatch(toggleModal(true));
					dispatch(deleteFlash(flash_id));
					// }
				}
			} else {
				dispatch(
					setErrorMessage(
						`You dont' have enough resources to craft ${craft.template_name}!`
					)
				);
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(setBackgroundUpdate(true));
		}
	};

	const HandleMbsCraft = async () => {
		try {
			dispatch(cancelLoading(false));
			if (isCraftable === null) {
				let craftCoin = coinsId.slice(0, craft?.coins_mint);
				const resultAction = await dispatch(
					mbsCraft({ name: craft.name, coins_id: craftCoin })
				).unwrap();
				if (resultAction?.transaction_id !== null) {
					const flash_id = Date.now();
					const flashMessage = {
						id: flash_id,
						content: `${craft.name} is coming soon.`,
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage));
					const response = await dispatch(
						getMbsCraftTransaction(resultAction?.transaction_id)
					).unwrap();
					if (response) {
						let temp = [];
						temp.push(response.asset_id);
						const res2 = await dispatch(mbsClaimAsset(temp)).unwrap();
						if (res2) {
							const inform = 'You have craft successfully!';
							dispatch(setErrorMessage(inform));
							dispatch(toggleModal(true));
							dispatch(setBackgroundUpdate(true));
							dispatch(deleteFlash(flash_id));
						}
					}
				}
			} else {
				dispatch(
					setErrorMessage("You dont' have enough tokens to craft this tool!")
				);
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			dispatch(setBackgroundUpdate(true));
		}
	};

	const HandleBuildingCraft = async () => {
		try {
			dispatch(cancelLoading(false));
			if (isCraftable === null) {
				const resultAction = await dispatch(
					craftBuilding({ template_id: craft.template_id, ticket: ticket })
				).unwrap();
				if (resultAction?.transaction_id !== null) {
					const flash_id = Date.now();
					const flashMessage = {
						id: flash_id,
						content: `${craft.name} is on the way sir!`,
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage));
					// const { claim } = await dispatch(
					// 	getBuildingTransaction(resultAction?.transaction_id)
					// ).unwrap();
					// if (claim) {
					// with discount ${claim.discount}%
					const inform = `You have craft ${craft.name} successfully `;
					dispatch(setErrorMessage(inform));
					dispatch(toggleModal(true));
					// }
					dispatch(deleteFlash(flash_id));
				}
			} else {
				dispatch(
					setErrorMessage(
						`You dont' have enough resources to craft ${craft.name}!`
					)
				);
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(setBackgroundUpdate(true));
		}
	};
	const HandleChoose = (index) => {
		setSetlectedCardIndex(index);
	};

	const sideScroll = (direction, speed, distance, step) => {
		var element = document.getElementById('chest-card-list');
		// console.log(container);
		var scrollAmount = 0;
		var slideTimer = setInterval(function(){
			if(direction == 'left'){
				element.scrollLeft -= step;
			} else {
				element.scrollLeft += step;
			}
			scrollAmount += step;
			if(scrollAmount >= distance){
				window.clearInterval(slideTimer);
			}
		}, speed);
	}

	return (
		<section>
			<div className='home-container'>
				<div className='home-content'>
					{/* <CardList
						data={crafts}
						selected={selectedCardIndex}
						HandleChoose={HandleChoose}
					/> */}
					<div className='home__card-container'>
						<Card {...craft} />
						{/* <div className='smithy-info-container'> */}
							<div className='info-section'>
								<div className='info-text__section'>
									<div className='info-title'>
										{craft?.type && (
											<div
												className='info-type-icon'
												style={{
													backgroundImage: `url(${
														resourceIconMapping[craft?.type]
													})`,
												}}></div>
										)}
										{craft?.num_slots && (
											<div
												className='info-type-icon'
												style={{
													backgroundImage: `url("/img/buidling-icon.svg")`,
												}}></div>
										)}
										<div className='info-title-name'>
											{craft?.template_name || craft?.name}
										</div>
										{/* {craft?.level && (
											<div className='info-title-level'>
												LV: {craft?.level || null}
											</div>
										)} */}
									</div>
									<div className='info-content'>
										{craft?.reward && (
											<div className='info-label'>
												REWARD RATE:
												<div className='info-description'>{'+' + craft?.reward + '%'}</div>
											</div>
										)}
										{craft?.saved_claims >= 0 && (
											<div className='info-label'>
												STORED MINING:
												<div className='info-description'>
													{'+' + craft?.saved_claims + ' HOURS' || 0}
												</div>
											</div>
										)}
										{craft?.shard_production >= 0 && (
											<div className='info-label'>
												SHARD PRODUCTION:
												<div className='info-description'>
													{'+' + craft.shard_production}
												</div>
											</div>
										)}
										{craft?.rarity && (
											<div className='info-label'>
												Rarity:
												<div className='info-description'>
													{craft?.rarity || null}
												</div>
											</div>
										)}
										{craft?.additional_tools >= 0 && (
											<div className='info-label'>
												EXTRA TOOL CAPACITY:
												<div className='info-description'>
													{'+' + craft?.additional_tools || 0}
												</div>
											</div>
										)}
										{craft?.additional_energy >= 0 && (
											<div className='info-label'>
												EXTRA ENERGY CAPACITY:
												<div className='info-description'>
													{'+' + craft?.additional_energy || 0}
												</div>
											</div>
										)}
										{craft?.required_claims >= 0 && (
											<div className='info-label'>
												Required Builds:
												<div className='info-description'>
													{craft.required_claims}
												</div>
											</div>
										)}
										{craft?.num_slots >= 0 && (
											<div className='info-label'>
												Number of Slots:
												<div className='info-description'>{craft.num_slots}</div>
											</div>
										)}
										{/* {craft?.charged_time >= 0 && (
											<div className='info-label'>
												Charge Time:
												<div className='info-description'>
													{craft.charged_time / 60 > 60
														? craft.charged_time / 3600 + ' hours'
														: parseFloat(craft.charged_time / 60).toFixed(2) +
																' mins' || null}
												</div>
											</div>
										)} */}

										{craft?.energy_consumed >= 0 && (
											<div className='info-label'>
												Energy Consumed:
												<div className='info-description'>
													{craft?.energy_consumed || 0}
												</div>
											</div>
										)}
										{craft?.durability_consumed && (
											<div className='info-label'>
												Durability Consumed:
												<div className='info-description'>
													{craft?.durability_consumed || null}
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
							<div className='forge__resource-section'>
								{craft?.oxygen_mint && (
									<div className='forge__resource--tilte--tm'>CRAFT COST</div>
								)}
								{!craft?.oxygen_mint && (
									<div className='forge__resource--tilte'>CRAFT COST</div>
								)}
								<div className='forge__resource-container'>
									<div className='forge__resource-group'>
										<img
											src={resourceIconMapping.Plasma}
											alt='PLASMA'
											className='forge__resource--image'
										/>
										<div
											className={
												'forge__resource--text ' +
												(balances?.plasma >= (craft?.plasma_mint || craft?.plasmas_mint)
													? 'forge_success'
													: 'fail')
											}>
											{craft?.plasma_mint || craft?.plasmas_mint || 0}
										</div>
									</div>
									{/* {craft?.asteroid_mint && (    // updated by */}
									{(
										<div className='forge__resource-group'>
											<img
												src={resourceIconMapping.Asteroid}
												alt='ASTEROID'
												className='forge__resource--image-asteroid'
												// style={{
												// 	transform: 'rotate(-2.27deg)',
												// }}
											/>
											<div
												className={
													'forge__resource--text ' +
													(balances?.asteroi >= craft?.asteroid_mint ? 'forge_success_asteroid' : 'fail-asteroid')
												}>
												{craft?.asteroid_mint || 0}
											</div>
										</div>
									)}
									{craft?.oxygen_mint && (
										<div className='forge__resource-group'>
											<img
												src={resourceIconMapping.Oxygen}
												alt='OXYGEN'
												className='forge__resource--image-oxygen'
												// style={{
												// 	transform: 'rotate(-2.27deg)',
												// }}
											/>
											<div
												className={
													'forge__resource--text ' +
													(balances?.oxygen >= craft?.oxygen_mint ? 'forge_success_oxygen' : 'fail-oxygen')
												}>
												{craft?.oxygen_mint || 0}
											</div>
										</div>
									)}
									{craft?.coins_mint && (
										<div className='forge__resource-group'>
											<img
												src='./img/Galaxy-coin.png'
												height={40}
												width={40}
												alt='COIN'
												className='forge__resource--image'
											/>
											<div
												className={
													'forge__resource--text ' +
													(totalCoin >= craft?.coins_mint ? '' : 'fail')
												}>
												{craft?.coins_mint || 0}
											</div>
										</div>
									)}
								</div>
							</div>
							{/* {craft?.asteroid_mint && (    // updated by
								<TicketInput
									ticket={ticket}
									setTicket={setTicket}
									ticketsChest={ticketsChest}
								/>
							)} */}
							{/* <div className='smithy-forge--button tooltip-title'>
								<Button
									text='CRAFT COST'
									atr='long'
									isDisabled={'disabled'}
									wrapperClassname='full-width'
									handleClick={() => {}}
								/>
							</div> */}
							<div className='smithy-forge--button tooltip'>
								<Button
									text='CRAFT'
									atr='long'
									isDisabled={isCraftable}
									wrapperClassname='full-width'
									handleClick={HandleCraft}
								/>
								{isCraftable === 'disabled' && (
									<span className='tooltiptext tooltip-bottom'>
										<i className='arrow-up'></i>Look like you don't have enough
										resources
									</span>
								)}
							</div>
						{/* </div> */}
					</div>
				</div>
			</div>
			<div>
				<button className='slide-prev' id="slideBack" type="button" onClick={() => sideScroll('left',25,200,40)}></button>
				<div className="chest-container">
					<div className='chest-content'>
						<div className='chest-card-list' id='chest-card-list'>
							{crafts.map(
								(card, index) =>
									card.template_name != "" && ( // updated by        original: no if case
										<GameCard
											card={card}
											key44={index}
											plasma={'null'}
											canBurn={null}
											handleChoose={HandleChoose}
										/>
									)
							)}
						</div>
					</div>
				</div>
				<button className='slide-next' id="slide" type="button"  onClick={() => sideScroll('right',25,200,40)}></button>
			</div>
		</section>
	);
}
