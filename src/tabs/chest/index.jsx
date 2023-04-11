/** @format */

import React from 'react';
// import './index.scss';
import GameCard from '../../components/GameCard/GameCard';
import { useSelector } from 'react-redux';

import EmtyTab from '../../components/EmptyTab/EmtyTab';
import { getCanBurn } from '../../redux/slice/OxygensSlicer';

export default function Chest() {
	const usingItems = useSelector((state) => state.tools.usingItems);
	const usingBadges = useSelector((state) => state.badge.usingBadges);
	const toolChest = useSelector((state) => state.atomic.tools);
	const ticketsChest = useSelector((state) => state.atomic.tickets);
	const badgeChest = useSelector((state) => state.atomic.memberships);
	const animalsChest = useSelector((state) => state.atomic.farmanimals);
	const buildingChest = useSelector((state) => state.atomic.farmbuilding);
	const plantsChest = useSelector((state) => state.atomic.plants);
	const oxygensChest = useSelector((state) => state.atomic.oxygens);
	const packsChest = useSelector((state) => state.atomic.packs);
	const refundChest = useSelector((state) => state.atomic.refundChest);
	const coinConfig = useSelector((state) => state.coin.coinConfig);
	const plasma = useSelector((state) => state.user.balances.plasma);
	// const plantsUsing = useSelector((state) => state.plants.plantsUsing);
	// const cowUsing = useSelector((state) => state.animals.cowUsing);
	// const chickenUsing = useSelector((state) => state.animals.chickenUsing);
	const canBurn = useSelector((state) => getCanBurn(state.oxygens));
	const chestItems = usingBadges
		// ?.concat(usingItems)
		?.concat(ticketsChest)
		?.concat(refundChest)
		?.concat(plantsChest)
		?.concat(badgeChest)
		?.concat(animalsChest)
		?.concat(buildingChest)
		?.concat(oxygensChest)
		?.concat(coinConfig)
		?.concat(toolChest)
		?.concat(packsChest);
	const isPlayable = chestItems.length > 0;

	const sideScroll = (direction, speed, distance, step) => {
		var element = document.getElementById('chest-card-list44');
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

	return isPlayable ? (
		<>
			<section>
				<button className='slide-prev' id="slideBack" type="button" onClick={() => sideScroll('left',25,200,20)}></button>
				<div className='chest-container'>
					<div className='chest-content'>
						<div className='chest-card-list' id='chest-card-list44'>
							{chestItems.map(
								(card, index) =>
									card.asset_id && (
										<GameCard
											card={card}
											key={index}
											plasma={plasma}
											canBurn={canBurn}
										/>
									)
							)}
						</div>
					</div>
				</div>
				<button className='slide-next' id="slide" type="button"  onClick={() => sideScroll('right',25,200,20)}></button>
			</section>
			{/* <div className="wapper"></div> */}
		</>
	) : (
		// <div className="chest-container"></div>
		<EmtyTab />
	);
}
