/** @format */

import React from 'react';
import PlasmaCards from './PlasmaCards';
import AsteroidCards from './AsteroidCards';
import OxygenCards from './OxygenCards';
import { useSelector } from 'react-redux';
export default function SatelliteCards() {
	const selectedMap = useSelector((state) => state.game.selectedMap);
	const usingItems = useSelector((state) => state.tools.usingItems);
	const asteroidCards = usingItems.filter((item) => item.type === 'Asteroid');
	const oxygenCards = usingItems.filter((item) => item.type === 'Oxygen');
	const plasmaCards = usingItems.filter((item) => item.type === 'Plasma');

	return (
		selectedMap === 0 && (
			<section className='satellite_cards-container'>
				<div className='satellite_cards-content'>
					<OxygenCards cards={oxygenCards} />
					<PlasmaCards cards={plasmaCards} />
					<AsteroidCards cards={asteroidCards} />
				</div>
			</section>
		)
	);
}