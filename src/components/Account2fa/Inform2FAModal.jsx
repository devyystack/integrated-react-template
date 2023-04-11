/** @format */

import React from 'react';
import ReactDOM from 'react-dom';
import { Divider } from '../../assets/icon/index.js';
import Button from './Button';
import styles from './VerifyModal.module.js';
import CloseButton from '../../assets/img/close-button.png';
import Inform2FA from './Inform2FA';

const Inform2FAModal = ({ HandleCancel, title, type, isError }) => {
	return ReactDOM.createPortal(
		<React.Fragment>
			<div className={styles.wrapper} tabIndex={-1} role='dialog'>
				<div className={styles.container}>
					<input
						type='image'
						src={CloseButton}
						alt='close'
						onClick={() => HandleCancel()}
						className={styles.CloseButton}
					/>
					<section className={styles.header}>
						<div className={styles.title}>{title}</div>
						<Divider
							width='46.2rem'
							height='1.3rem'
							className={styles.divider}
						/>
					</section>
					<div className={styles.contentWrapper}>
						<Inform2FA type={type} isError={isError} />
					</div>
					<div className={styles.footer}>
						<Button title='Confirm' handleClick={() => HandleCancel()} />
					</div>
				</div>
			</div>
		</React.Fragment>,
		document.body
	);
};

export default Inform2FAModal;
