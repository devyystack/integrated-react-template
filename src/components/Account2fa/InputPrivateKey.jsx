/** @format */

import React from 'react';

import styles from './InputPrivateKey.module.js';

export default function InputPrivateKey({ priavteKey, setPrivateKey }) {
	return (
		<section className={styles.container}>
			<div className={styles.header}>Security Verification</div>
			<div className={styles.wrapper}>
				<label htmlFor='opt-code' className={styles.header}>
					Private Key:
				</label>
				<input
					type='text'
					id='opt-code'
					value={priavteKey}
					onChange={(e) => setPrivateKey(e.target.value)}
					className={styles.input}
				/>
				<label htmlFor='opt-code' className={styles.description}>
					Enter your Private Key. You should use your OTP code instead of
					Private key.
				</label>
			</div>
		</section>
	);
}
