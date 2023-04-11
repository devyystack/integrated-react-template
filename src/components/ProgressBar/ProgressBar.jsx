/** @format */

import React, { useEffect, useState, useRef } from 'react';
import CountDown from '../../common/CountDown/CountDown';
export default function ProgressBar({
	currentStack,
	maxStack,
	height,
	next_availability,
	handleFinish,
}) {
	const [stacks, setStacks] = useState([]);
	const [stackWidth, setStackWidth] = useState(12);
	const ref = useRef();

	useEffect(() => {
		let temp = [];

		for (let i = 0; i < currentStack; i++) {
			temp.push('/img/progress-stack.png');
		}
		setStacks(temp);
		if (ref.current) {
			const widthContainer = ref.current.getBoundingClientRect();
			setStackWidth((widthContainer?.width * 0.73) / maxStack);
		}
	}, [currentStack, maxStack]);

	return (
		<div className='progress-bar-container' ref={ref}>
			<div className='progress-bar-stack__wrapper'>
				{stacks.map((stack, index) => (
					<img
						src={stack}
						alt='stack'
						key={index}
						className='progress-bar-stack--item'
						style={{ width: stackWidth + 'px', height: height + 'rem' }}
					/>
				))}
			</div>
			<span
				className='progress-bar-track'
				style={{
					backgroundImage: 'url(/img/progress-track.png)',
				}}></span>
			{!!next_availability && (
				<div className='progress-bar-countdown'>
					<CountDown
						handleFinish={handleFinish}
						next_availability={next_availability}
					/>
				</div>
			)}
		</div>
	);
}
