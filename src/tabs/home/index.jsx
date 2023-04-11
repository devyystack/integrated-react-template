/** @format */

import React from 'react';
// import './index.scss';
import { useSelector, useDispatch } from 'react-redux';
import { chooseUsingCard } from '../../redux/slice/ToolsSlicer';
import CardList from '../../components/CardList/CardList';
import HomeCard from './homeCard';
import EmtyTab from '../../components/EmptyTab/EmtyTab'; 

import { getCanBurn } from '../../redux/slice/OxygensSlicer';
import GameCard from '../../components/GameCard/GameCard';

export default function Home() {
	const selectedMap = useSelector((state) => state.game.selectedMap);
	const usingCardsList = useSelector((state) => state.tools.usingItems);
	const usingBadges = useSelector((state) => state.badge.usingBadges);
	const cowUsing = useSelector((state) => state.animals.cowUsing);
	const chickenUsing = useSelector((state) => state.animals.chickenUsing);
	const plantsUsing = useSelector((state) => state.plants.plantsUsing);
	const userEnergy = useSelector((state) => !!state.user.info ? state.user.info.energy : 200);
	const plasma = useSelector((state) => state.user.balances.plasma);


	const canBurn = useSelector((state) => getCanBurn(state.oxygens));


	const selectedUsingCard = useSelector(
		(state) => state.tools.selectedUsingCard
	);
	const dispatch = useDispatch();

	const HandleChoose = (index) => {
		dispatch(chooseUsingCard(index));
	};

	const HanldeDataMapping = () => {
		switch (selectedMap) {
			case 0:
				return usingCardsList?.concat(usingBadges);
			case 1:
				return chickenUsing;

			case 2:
				return plantsUsing;
			case 3:
				return cowUsing;
			default:
				break;
		}
	};

	const usingItems = HanldeDataMapping();
	
	const selectedCardMapping = selectedUsingCard;
	const isPlayable = usingItems?.length > 0;

	const storeMiningPlasma = usingItems.reduce((storeMiningPlasmas, usingItem) => {
		if (usingItem.saved_claims && usingItem.type === 'Plasma') {
			return (storeMiningPlasmas += usingItem.saved_claims);
		}
		return storeMiningPlasmas;
	}, 0);
	const storeMiningOxygen = usingItems.reduce((storeMiningOxygens, usingItem) => {
		if (usingItem.saved_claims && usingItem.type === 'Oxygen') {
			storeMiningOxygens += usingItem.saved_claims;
		}
		return storeMiningOxygens;
	}, 0);

	const storeMiningAsteroid = usingItems.reduce((storeMiningAsteroids, usingItem) => {
		if (usingItem.saved_claims && usingItem.type === 'Asteroid') {
			storeMiningAsteroids += usingItem.saved_claims;
		}
		return storeMiningAsteroids;
	}, 0);
	const storeMining = [storeMiningPlasma, storeMiningOxygen, storeMiningAsteroid];

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

	return isPlayable ? (
		<section >
			<div className='home-container'>
				<div className='home-content'>
					{/* <CardList
						data={usingItems}
						selected={selectedCardMapping}
						HandleChoose={HandleChoose}
					/> */}
					<HomeCard
						data={usingItems[selectedCardMapping]}
						userEnergy={userEnergy}
						plasma={plasma}
						storeMining={storeMining}
					/>
				</div>
			</div>
			<div>
				<button className='slide-prev' id="slideBack" type="button" onClick={() => sideScroll('left',25,200,20)}></button>
				<div className="chest-container">
					<div className='chest-content'>
						<div className='chest-card-list' id='chest-card-list'>
							{usingItems.map(
								(card, index) =>
									card.asset_id && (
										<GameCard
											card={card}
											key44={index}
											plasma={plasma}
											canBurn={canBurn}
											handleChoose={HandleChoose}
										/>
									)
							)}
						</div>
					</div>
				</div>
				<button className='slide-next' id="slide" type="button"  onClick={() => sideScroll('right',25,200,20)}></button>
			</div>
		</section>
	) : (
		<EmtyTab />
	);
}
