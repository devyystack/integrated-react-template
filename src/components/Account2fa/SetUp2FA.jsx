/** @format */

import React, { useState } from 'react';
import styles from './SetUp2FA.module.js';

import { lockFeature } from '../../config';

/**
 *
 * @param {*} __features: feature fetched from blockchain
 * @param {*} onNext : listener for getting Feature and Unlock time to parents
 * @param {*} setMainFeature : Hook from parents
 * @param {*} setMainRadio Hook from parents
 * @returns
 */
export default function SetUp2FA({
	__features,
	setMainFeature,
	setMainRadio,
	radioState,
	isUnlocked2FA = true,
}) {
	const [checkboxState, setCheckedState] = useState(() =>
		lockFeature.map((feature) => feature.value & __features)
	);
	// features.value & __features ||
	const handleOnChange = (position) => {
		const updatedCheckedState = checkboxState.map((item, index) =>
			index === position ? !item : item
		);
		setCheckedState(updatedCheckedState);
		let totalPrice = 0;
		updatedCheckedState.forEach((item, index) => {
			if (item) totalPrice += lockFeature[index].value;
		});

		setMainFeature(totalPrice);
	};

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				Set up two-factor authentication (2FA)
			</div>
			<div className={styles.wrapper}>
				<section className={styles.boxWrapper}>
					<div className={styles.header}>Life time</div>

					<div className={styles.group__button}>
						<input
							type='radio'
							id='minutes'
							name='duration'
							value={1800}
							disabled={!isUnlocked2FA}
							checked={radioState === 1800}
							className={styles.input}
							onChange={() => setMainRadio(1800)}
						/>
						<label htmlFor='minutes' className={styles.label}>
							30 minutes
						</label>
					</div>
					<div className={styles.group__button}>
						<input
							type='radio'
							id='hour'
							name='duration'
							value={3600}
							disabled={!isUnlocked2FA}
							checked={radioState === 3600}
							className={styles.input}
							onChange={() => setMainRadio(3600)}
						/>
						<label htmlFor='hour' className={styles.label}>
							01 hour
						</label>
					</div>
				</section>

				<section className={styles.boxWrapper}>
					<div className={styles.header}>Lock Feature</div>
					{lockFeature.map((features, index) => (
						<div className={styles.group__button} key={index}>
							<input
								type='checkbox'
								className={styles.input}
								id={features.name}
								name='features'
								disabled={!isUnlocked2FA}
								value={features.value}
								checked={checkboxState[index]}
								onChange={() => handleOnChange(index)}
							/>
							<label htmlFor={features.name} className={styles.label}>
								{features.name}
							</label>
						</div>
					))}
				</section>
			</div>
		</section>
	);
}
