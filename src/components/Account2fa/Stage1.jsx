/** @format */

import React from 'react';
import QRCode from 'react-qr-code';
import styles from './stage1.module.js';
export default function Stage1({ account }) {
	const [viewWidth, setViewWidth] = React.useState(window.innerWidth);

	React.useEffect(() => {
		setViewWidth(
			Math.max(
				document.documentElement.clientWidth || 0,
				window.innerWidth || 0
			)
		);
	}, []);
	return (
		<section className={styles.container}>
			<div className={styles.header}>
				Set up via a third-party authentication app
			</div>
			<div className={styles.description}>
				Please use your authenticator app (such as: Duo or Google Authenticator)
				to scan this QR code.
			</div>
			<div className={styles.wrapper}>
				<div className={styles.qr}>
					<QRCode
						value={`otpauth://totp/${account.name}?secret=${account.otpSecret}&issuer=GalaxyMiners1`}
						size={(15 * viewWidth) / 144}
					/>
				</div>
				<div className={styles.code}>
					<p className={styles.header}>
						Or enter this code in your authenticator app
					</p>
					<div
						className={styles.details}
						style={{ backgroundImage: 'url(/img/arrow-bar.png)' }}>
						{account.otpSecret}
					</div>
				</div>
			</div>
		</section>
	);
}
