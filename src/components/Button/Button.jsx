/** @format */

import React from 'react';

/**
 *
 * @param {String} wrapperClassname ='full-width'
 * @param {String} isDisabled = 'disabled'
 * @param {String} atr = 'short'
 * @param {function} handleClick
 * @param {String} 	text
 * @returns Button
 */
export default function Button({
	wrapperClassname,
	isDisabled,
	atr,
	handleClick,
	text,
}) {
	return (
		<button
			className={`button-section ` + wrapperClassname || null}
			onClick={() => handleClick()}>
			<div className={`plain-button ` + atr + ` ` + isDisabled || null}>
				{text}
			</div>
		</button>
	);
}
