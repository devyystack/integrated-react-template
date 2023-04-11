/** @format */
import React from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChooseTab } from "../../redux/slice/navBarSlice";
import MarketItemList from "./MarketItemList";

export default function Market(props) {
	const dispatch = useDispatch();
	const marketConfig = useSelector((state) => state.market.marketConfig);
	const plantsConfig = useSelector((state) => state.plants.plantsConfig);
	const animalsConfig = useSelector((state) => state.animals.animalsConfig);
	const marketMap = plantsConfig?.concat(animalsConfig);
	let data = [];
	marketConfig.forEach((config) => {
		const temp = marketMap.find(
			(plt) => plt.template_id === config.template_id
		);
		const test1 = Object.assign({}, config);
		const test2 = Object.assign({}, temp);
		const test = Object.assign(test1, test2);
		data.push(test);
	});

	return ReactDOM.createPortal(
		<React.Fragment>
			<div className='modal-wrapper' tabIndex={-1} role='dialog'>
				<MarketItemList
					data={data}
					handleClose={() => dispatch(ChooseTab(0))}
				/>
			</div>
		</React.Fragment>,
		document.body
	);
}
