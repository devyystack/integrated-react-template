/** @format */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeData } from "./exchangeSlice";
const mapResourceTypes = {
	GMP: "plasma",
	GMA: "asteroid",
	GMO: "oxygen",
};
export default function ExchangeInput(props) {
	const dispatch = useDispatch();
	const [exchangeValue, setExchangeValue] = useState(0);
	const [max, setMax] = useState(0);
	const tax = useSelector((state) => state.exchange.tax);

	useEffect(() => {
		if (props.type === "straight") {
			setExchangeValue(props?.exchangeValue);
			setMax(parseFloat(props?.initialResource || 0));
		} else {
			setExchangeValue((props.exchangeValue * (100 - tax)) / 100);
			setMax(parseFloat(props?.initialResource || 0));
		}
	}, [props.exchangeValue, props.type, tax, props.initialResource]);

	const handleChange = (e) => {
		if (props.type === "straight") {
			if (e.target.value > parseFloat(props.initialResource)) {
				dispatch(
					changeData({
						[mapResourceTypes[props.resource] || props.resource]:
							parseFloat(props.initialResource),
					})
				);
			} else if (e.target.value < 0) {
				dispatch(
					changeData({
						[mapResourceTypes[props.resource] || props.resource]: 0,
					})
				);
			} else {
				dispatch(
					changeData({
						[mapResourceTypes[props.resource] || props.resource]:
							e.target.value,
					})
				);
			}
		} else {
			const change = (e.target.value * 100) / (100 - tax);

			if (change > parseFloat(props.initialResource)) {
				dispatch(
					changeData({
						[mapResourceTypes[props.resource] || props.resource]:
							max,
					})
				);
			} else if (change < 0) {
				dispatch(changeData({ [mapResourceTypes[props.resource]]: 0 }));
			} else {
				dispatch(
					changeData({ [mapResourceTypes[props.resource]]: change })
				);
			}
		}

		e.preventDefault();
	};
	return (
		<div className='exchange-input-container'>
			<input
				type='number'
				min={0}
				max={max}
				value={exchangeValue}
				lang='en'
				inputMode='decimal'
				className='exchange-input'
				onChange={(e) => handleChange(e)}
			/>

			<div className='input-append'>
				<img
					src={props.image}
					alt={props.resource}
					className='input-resource--image'
				/>
				<div className='input-resource'>{props.resource}</div>
			</div>
		</div>
	);
}
