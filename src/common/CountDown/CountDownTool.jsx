/** @format */

import React, { useState, useEffect } from 'react';

export default function CountDownTool(props) {
	const [currentCount, setCount] = useState(0);

	const calculateTimeLeft = () => {
		if (props?.next_availability) {
			let newTime = props?.next_availability * 1000 - Date.now();

			if (newTime <= 0) {
				props?.handleFinish(true);
				props.handleStoreMining(true);
				newTime = 0;
			}
			setCount(newTime);
		} else {
			setCount(0);
		}
	};
	useEffect(() => {
		let timer1 = setTimeout(() => {
			calculateTimeLeft();
		}, 100);
		return () => {
			clearTimeout(timer1);
		};
	});

	const hours = Math.floor(currentCount / (3600 * 1000)) || 0;
	const minutes = Math.floor((currentCount % (3600 * 1000)) / 60000) || 0;
	const seconds =
		Math.floor(currentCount / 1000 - (hours * 3600 + minutes * 60)) || 0;
	const timeStr =
		'' +
		(hours < 10 ? '0' + hours : hours) +
		" : " +
		(minutes < 10 ? '0' + minutes : minutes) +
		' : ' +
		(seconds < 10 ? '0' + seconds : seconds) +
		'';

	return <div className='card-container--time' style={{width: '6.4em', marginLeft: '4%', textAlign: 'left'}} >{timeStr}</div>;
}
