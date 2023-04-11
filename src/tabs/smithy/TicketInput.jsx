/** @format */

import React, { useLayoutEffect, useState } from 'react';
import styles from './TicketInput.module.js';
import { ticketTemplate } from '../../config';
const tickets = [0, 5, 10, 15];
export default function TicketInput({ ticket, setTicket, ticketsChest }) {
	const [ticketState, setTicketState] = useState([...Array(4)].fill(true));
	useLayoutEffect(() => {
		ticketTemplate.main.forEach((e, index) => {
			ticketsChest.forEach((chestTemp, i) => {
				if (chestTemp.template.template_id === e + '') {
					let temp = ticketState;
					temp[index + 1] = false;
					temp[0] = false;
					setTicketState(temp);
				}
			});
		});
	}, [ticketsChest, ticketState]);

	return (
		<div className={styles.container}>
			<div className={styles.title}>DISCOUNT</div>
			<div className={styles.inputWrapper}>
				{tickets.map((value, index) => (
					<label key={index} htmlFor={value} className={styles.label}>
						<input
							disabled={ticketState[index]}
							type='radio'
							id={value}
							name='ticket'
							checked={ticket === value}
							onChange={(e) => setTicket(value)}
							value={value}
						/>
						{value}%
					</label>
				))}
			</div>
		</div>
	);
}
