/** @format */

import React from 'react';
// import './index.scss'
import ResourceBar from './resourceBar';

import asteroid from '../../static/icons/asteroid-icon.png';
import oxygen from '../../static/icons/oxygen-icon.png';
import plasma from '../../static/icons/plasma-icon.png';
import energy from '../../static/icons/energy-icon.png';

import { useSelector } from 'react-redux';
import { selectUserInfo, selectBalances } from '../../redux/slice/userSlicer';
const header = ['MINE', 'CHICKEN', 'CROP', 'COW'];
export default function HeaderBar() {
	const resourceImg = [
		{
			name: 'OXYGEN',
			icon: oxygen,
		},
		{
			name: 'ASTEROID',
			icon: asteroid,
		},
		{
			name: 'PLASMA',
			icon: plasma,
		},
		{
			name: 'energy',
			icon: energy,
		},
	];

	const index = useSelector((state) => state.navBar.selectedTab);
	const title = useSelector((state) => state.navBar.tabs[index]);
	const balances = useSelector(selectBalances);
	const userInfo = useSelector(selectUserInfo);
	const selectedMap = useSelector((state) => state.game.selectedMap);
	return (
		<section>
			<div className='container__header'>
				<ResourceBar {...resourceImg[0]} amount={balances.oxygen || 0} />
				{/* <ResourceBar {...resourceImg[1]} amount={balances.asteroid || 0} />  // updated by  */}
				<ResourceBar {...resourceImg[1]} amount={balances.asteroi || 0} /> 
				<ResourceBar {...resourceImg[2]} amount={balances.plasma || 0} />
			</div>
			{/* <div		// updated by      original: no commenting
				style={{ backgroundImage: 'url(./img/border-button.png)' }}
				className='container__header--tilte'>
				{title?.name || header[selectedMap]} 
			</div> */}
			<div className='energy__bar'>
				<ResourceBar {...resourceImg[3]} {...(userInfo || 0)} />
			</div>
		</section>
	);
}
