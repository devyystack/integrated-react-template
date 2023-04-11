/** @format */

import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { useDispatch, useSelector } from 'react-redux';
import { ChooseTab } from '../../redux/slice/navBarSlice';
import MapComponent from './MapComponent';
import closeButton from '../../assets/img/close-button.png';

// import './map.scss';
const mapData = [
	{
		title: 'Mining',
		bgImage: './img/home-map-bg.jpg',
	},
	{
		name: 'Coop',
		title: 'Chicken',
		bgImage: '/img/chicken-map.jpg',
	},
	{
		name: 'Farm Plot',
		title: 'Plant',
		bgImage: './img/crop-map.jpg',
	},
	{
		name: 'Cowshed',
		title: 'Cow',
		bgImage: './img/cow-map.jpg',
	},
];
export default function Map() {
	const dispatch = useDispatch();
	const usingBuilds = useSelector((state) => state.builds.usingBuilds);
	const cowUsing = useSelector((state) => state.animals.cowUsing);
	const chickenUsing = useSelector((state) => state.animals.chickenUsing);
	const plantsUsing = useSelector((state) => state.plants.plantsUsing);
	const usingItems = [
		0,
		chickenUsing.length,
		plantsUsing.length,
		cowUsing.length,
	];

	const ref = useRef(null);
	const [downMarket, setDownMarket] = useState();

	const handleClose = () => {
		setDownMarket('map-container-down');
		setTimeout(() => {
			dispatch(ChooseTab(0));
		}, 500);
	};

	return ReactDOM.createPortal(
		<React.Fragment>
			<div className='modal-wrapper' tabIndex={-1} role='dialog'>
				<div
					className='modal-content'
					style={{
						margin: 'auto',
					}}>
					<section className={`modal-map-container ${downMarket}`} ref={ref}>
						<div className='modal-map-title__wrapper'>
							<div
								className='modal-map-title'
								style={{
									backgroundImage: 'url(/img/border-button.png)',
								}}>
								MAP
							</div>
						</div>
						<div className='modal-header'>
							<img
								src={closeButton}
								alt='Close'
								className='close-map-modal image-button'
								onClick={() => handleClose()}
							/>
						</div>
						<div className='modal-map-content'>
							{mapData.map((data, index) => (
								<MapComponent
									key={index}
									index={index}
									usingItems={usingItems[index]}
									{...data}
									build={usingBuilds[index]}
								/>
							))}
						</div>
					</section>
					<div className='click-out-side' onClick={() => handleClose()} />
				</div>
			</div>
		</React.Fragment>,
		document.body
	);
}
