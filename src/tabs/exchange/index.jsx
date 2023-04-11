/** @format */

import React, { useEffect } from "react";
// import "./index.scss";
import { useSelector, useDispatch } from "react-redux";

import DepositTab from "./DepositTab";
import WithdrawTab from "./WithdrawTab";
import { chooseTab } from "./exchangeSlice";
import { getConfigs, getTokens } from "./exchangeSlice";
export default function Exchange() {
	const selectedTab = useSelector((state) => state.exchange.selectedTab);

	const dispatch = useDispatch();
	useEffect(() => {
		const update = setInterval(() => {
			dispatch(getConfigs());
			dispatch(getTokens());
		}, 5000);
		return () => clearInterval(update);
	});

	return (
		<section className='home-container'>
			<div className='home-content'>
				<div className='exchange-navbar'>
					<div
						className={
							"exchange-navbar--item " +
							(selectedTab === 0 && "selected")
						}
						onClick={() => dispatch(chooseTab(0))}>
						WITHDRAW
					</div>
					<div
						className={
							"exchange-navbar--item " +
							(selectedTab === 1 && "selected")
						}
						onClick={() => dispatch(chooseTab(1))}>
						DEPOSIT
					</div>
				</div>
				{selectedTab === 0 ? <WithdrawTab /> : <DepositTab />}
			</div>
		</section>
	);
}
