/** @format */

import React from 'react';
import styles from './Input2FA.module.js';

export default function Input2FA({ type, setMainOtp, OtpCode }) {
	return (
		<section className={styles.container}>
			<div className={styles.header}>
				{type === 'enable'
					? 'Enable your authenticator'
					: 'Security Verification'}
			</div>
			<div className={styles.wrapper}>
				<label htmlFor='opt-code' className={styles.header}>
					Verification code:
				</label>
				<input
					type='text'
					id='opt-code'
					value={OtpCode}
					onChange={(e) => setMainOtp(e.target.value)}
					className={styles.input}
				/>
				<label htmlFor='opt-code' className={styles.description}>
					Enter the 6 digit code from your authenticator app.
				</label>
			</div>
		</section>
	);
}
