/** @format */

import React from 'react';
import styles from './button.module.js';
import classnames from 'classnames';

export default function Button({ title, handleClick, color, disabled }) {
	return (
		<button
			onClick={handleClick}
			disabled={disabled}
			className={[
				classnames(styles.button, {
					[styles.red]: color === 'red',
					[styles.disabled]: disabled,
				}),
			].join(' ')}>
			{title}
		</button>
	);
}
