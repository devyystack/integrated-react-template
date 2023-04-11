/** @format */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChooseTab } from '../../redux/slice/navBarSlice';

export default function Navbar() {
	const choosedTab = useSelector((state) => state.navBar.selectedTab);
	const titlesObject = useSelector((state) => state.navBar.tabs);

	const dispatch = useDispatch();

	const handleClick = (index) => {
		dispatch(ChooseTab(index));
		// if (choosedTab === index) {
		// 	dispatch(ChooseTab(7));
		// } else {
		// 	dispatch(ChooseTab(index));
		// }
	};

	return (
		<section className='navbar-container'>
			{titlesObject.map((group, index) => {
				return index !== 7 ? (
					<div
						className={
							index === choosedTab ? 'navbar-group active' : 'navbar-group'
						}
						key={index}
						onClick={() => handleClick(index)}>
						<img
							src={group.icon}
							alt={group.name}
							className='navbar-group--icon'
						/>

						{(
							<span className='tooltiptext tooltip-up'>
								{group.name}
							</span>
						)}

						{/* <div className='navbar-group--tilte'>{group.name}</div> */}
						<div className='navbar-group--tilte'>  </div>
					</div>
				) : (
					<a
						key={index}
						className='link'
						target='_blank'
						rel='noopener noreferrer'
						type='image'
						href='https://wax.atomichub.io/market?collection_name=galaxyminerx&order=desc&sort=created&symbol=WAX' // mainnet
						// href='https://wax-test.atomichub.io/market?collection_name=galaxyminerx&order=desc&sort=created&symbol=WAX' // testnet
					>
						<div className='navbar-group link' key={index}>
							<img
								src={group.icon}
								alt={group.name}
								className='navbar-group--icon'
							/>
							<div className='navbar-group--tilte'>{group.name}</div>
						</div>
					</a>
				);
			})}
		</section>
	);
}
