/** @format */

import React from 'react';
import styles from './stage2.module.js';
import { isDesktop } from 'react-device-detect';
import CoppyIcon from '../../assets/icon/copy-key.png';
import classnames from 'classnames';
export default function Stage2({ account }) {
	const copyFunc = () => {
		if (isDesktop) navigator.clipboard.writeText(account.privateKey);
	};
	return (
		<section className={styles.container}>
			<div className={styles.header}> Backup Key</div>
			<div className={styles.description}>
				Please save this Key on paper. This key will allow you to cover your
				authenticator in case of phone loss.
			</div>
			<div className={styles.body}>
				<div className={styles.code}>{account.privateKey}</div>
				<input
					type='image'
					src={CoppyIcon}
					disabled={!isDesktop}
					className={[
						classnames(styles.btn, {
							[styles.disabled]: !isDesktop,
						}),
					].join(' ')}
					widhth={60}
					height={60}
					alt='copy'
					onClick={() => {
						copyFunc();
					}}
				/>
			</div>
		</section>
	);
}
