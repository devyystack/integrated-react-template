/** @format */

import React from 'react';
import styles from './Inform2FA.module.js';
import Success from '../../assets/img/auth-success.png';
import Failed from '../../assets/img/auth-failed.png';

/**
 *
 * @param {*} type Disbaled - Enabled
 * @param {*} isError
 * @returns
 */
export default function Inform2FA({ type, isError }) {
	const status = isError ? 'failed to' : 'successfully';
	return (
		<section className={styles.container}>
			<div className={styles.header}>Authenticator {type}!</div>
			<div className={styles.wrapper}>
				<img
					src={isError ? Failed : Success}
					alt='success'
					className={styles.img}
					width='150'
					height='150'
				/>
				<div className={styles.description}>
					You have {status} {type} Authenticator{' '}
					{type === 'enabled' && 'to protect your account'}.
				</div>
			</div>
		</section>
	);
}
