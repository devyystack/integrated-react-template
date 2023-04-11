/** @format */

import React, { useEffect, useState } from 'react';

export default function Countdown({ next_availability }) {
	const [currentCount, setCount] = useState(0);
	const calculateTimeLeft = () => {
		if (next_availability) {
			let newTime = next_availability * 1000 - Date.now();
			if (newTime < 0) newTime = 0;
			setCount(newTime);
		}
	};
	useEffect(() => {
		setTimeout(() => {
			calculateTimeLeft();
		}, 100);
	});
	const hours = Math.floor(currentCount / (3600 * 1000)) || 0;
	const minutes = Math.floor((currentCount % (3600 * 1000)) / 60000) || 0;
	const seconds =
		Math.floor(currentCount / 1000 - (hours * 3600 + minutes * 60)) || 0;
	const timeStr =
		'' +
		(hours < 10 ? '0' + hours : hours) +
		':' +
		(minutes < 10 ? '0' + minutes : minutes) +
		':' +
		(seconds < 10 ? '0' + seconds : seconds);

	return (
		// <div className='satellite__card-container'>
		// 	<div className='satellite__card-time'>{timeStr}</div>
		// </div>
		<div></div>
	);
}
