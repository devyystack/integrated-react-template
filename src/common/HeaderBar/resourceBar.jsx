/** @format */

import React, { useEffect, useState } from 'react';
// import './resourceBar.scss'

import RecoverModal from '../../components/Modal/RecoverModal';
import useModal from '../../components/Modal/useModal';
import { useSpring, animated } from 'react-spring';
import useWindowSize from '../../utils/useWindowSIze';
import energyBar1 from '../../static/icons/energy-1.png'
import energyBar2 from '../../static/icons/energy-2.png'
import energyBar3 from '../../static/icons/energy-3.png'
import energyBar4 from '../../static/icons/energy-4.png'
const min = (a, b) => {
	return a > b ? b : a;
};

export default function ResourceBar(props) {
	const { isShowing, toggle } = useModal();

	const [amount, setAmount] = useState(0);
	useEffect(() => {
		setAmount(parseFloat(props?.amount || 0).toFixed(5));
	}, [props?.amount]);

	const [energy, setEnergy] = useState(0);
	useEffect(() => {
		setEnergy(parseInt(props.energy || 0));
	}, [props?.energy]);
	// eslint-disable-next-line
	const [viewWidth, viewHeight] = useWindowSize();

	// const width = isMobile ? 70 : 184
	const props3 = useSpring({
		width:
			((props.energy || 1) / (props.max_energy || 1)) *
			min(viewWidth / 144, viewHeight / 90) *
			19,
		backgroundColor: '#44AA22',
		config: { duration: 1000 },
	});
	//  184
	const calcFontSize = () => {
		const length = amount?.toString().length || energy?.toString().length;
		if (length < 4) return 2.2;
		if (length < 8) return 1.8;
		else return 1.6;
	};
	const props2 = useSpring({
		number:
			props.name === 'energy'
				? parseInt(energy)
				: parseFloat(amount).toFixed(4),
		config: {
			duration: 500,
			reset: false,
		},
	});
	return props.name !== 'energy' ? (
		<div className={'resource__group'}>
			<i className='resource-icon'>
				<img
					src={props.icon}
					alt='Resource Icon'
					className='resource-icon--image'
				/>
			</i>

			<animated.div
				className='resource-number'
				style={{ fontSize: calcFontSize() + ' rem' }}>
				<animated.div>
					{props2.number.to((x) =>
						parseFloat(x).toFixed(5).slice(0, -1)
					)}
				</animated.div>
			</animated.div>
		</div>
	) : (
		<div className={'resource__group__energy'}
			style={{backgroundImage: `url(${props.energy < props?.max_energy / 4 ? energyBar1 : (props.energy < props?.max_energy / 2 ? energyBar2 : (props.energy == props?.max_energy ? energyBar4 : energyBar3))})`}}
		>
			{/* <i className='resource-icon'>
				<img
					src={props.icon}
					alt='Resource Icon'
					className='resource-icon--image'
				/>
			</i> */}
			{/* {(
				<animated.div className='fill-yellow' style={props3} />
			)} */}

			{/* <animated.div
				className='resource-number'
				style={{ fontSize: '1.6rem', color: '#fff', 'writing-mode': 'vertical-rl', 'text-orientation': 'upright', position: 'relative', top: '-20%',	left: '34%' }}> */}
			<animated.div
				className='resource-number'
				style={{ fontSize: '1.8rem', color: '#fff', position: 'relative', top: `${props.energy < props?.max_energy / 4 ? '-8.8%' : (props.energy < props?.max_energy / 2 ? '-17.9%' : (props.energy == props?.max_energy ? '-35.6%' : '-26.6%'))}`,	left: '80%', background: "linear-gradient(90deg, #90a0a7, #c4cdde)", padding: '2% 12%', borderRadius: "1px 6px 6px 1px"}}>
				<animated.div>
					{props2.number.to((x) =>
						parseInt(x)
					)}
				</animated.div>
				{/* {props.name === 'energy' && ` /${props?.max_energy}`} */}
			</animated.div>
			
			<div className='resource-energy'>
				<img
					src='../../static/icons/plus.png'
					alt='plus'
					className='resource-energy--plus'
					onClick={toggle}
					style ={{ position: 'absolute', right: '21%', top: '46%', width: '50%'}}
				/>
			</div>
			<RecoverModal isShowing={isShowing} hide={toggle} />
		</div>
	);
}
