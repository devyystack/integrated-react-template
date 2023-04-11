/** @format */

import React from 'react';
import { StackActive, StackHolder } from '../../assets/icon/index.js';
// import { ReactComponent as StackHolder } from '../../assets/icon/pg-placeholder.svg';

import styles from './ProgressBar.module.js';

export default function ProgressBar({ currentStack, maxStack, height }) {
	return (
		<div className={styles.container}>
			<div className={styles.stack}>
				{[...Array(maxStack)].map((_, index) =>
					index < currentStack ? (
						<StackActive width='7.4rem' height='2.3rem' key={index} />
					) : (
						<StackHolder width='7.4rem' height='2.3rem' key={index} />
					)
				)}
			</div>
			<span
				className={styles.track}
				style={{
					backgroundImage: 'url(/img/progress-track-sm.png)',
				}}></span>
		</div>
	);
}
