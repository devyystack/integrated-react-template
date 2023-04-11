/** @format */

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

// import './index.scss'
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import {
	setLackResource,
	getWaxAccount,
	buyRam,
	buyCpuNet,
} from '../../redux/slice/GameSlicer';
import 'react-circular-progressbar/dist/styles.css';

export default function StakeModal({ lackingResource }) {
	const dispatch = useDispatch();
	const [lackingValue, setLackingValue] = useState(0);
	const [resourceType, setResourceType] = useState(lackingResource);
	const waxAccountInfo = useSelector((state) => state.game.waxAccountInfo);
	const refOutside = useRef(null);
	const handleClickOutside = (event) => {
		if (refOutside.current && !refOutside.current.contains(event.target)) {
			dispatch(setLackResource(''));
		}
	};

	useEffect(() => {
		let timer1 = setTimeout(async () => {
			await dispatch(getWaxAccount()).unwrap();
		}, 5000);
		return () => {
			clearTimeout(timer1);
		};
	});

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	});

	const handleClickStake = async () => {
		try {
			if (resourceType === 'RAM') {
				await dispatch(buyRam(lackingValue)).unwrap();
			} else {
				await dispatch(
					buyCpuNet({ [resourceType.toLowerCase()]: lackingValue })
				).unwrap();
			}
			await dispatch(getWaxAccount()).unwrap();
		} catch (error) {}
	};
	return ReactDOM.createPortal(
		<React.Fragment>
			<div className='modal-wrapper' tabIndex={-1} role='dialog'>
				<div className='modal-stake' ref={refOutside}>
					<div className='modal-stake-close'>
						<img
							src='./img/close-button.png'
							alt='Close'
							className='image-button close-modal'
							onClick={() => dispatch(setLackResource(''))}
						/>
					</div>
					<div className='modal-stake-header'>
						You dont have enough {lackingResource} to create transaction. Please
						stake WAX on {lackingResource} to continue.
					</div>
					<div className='modal-stake-content'>
						<div className='modal-stake-circle'>
							<div className='modal-circular-group'>
								<div className='circular-progress'>
									<CircularProgressbarWithChildren
										value={
											(waxAccountInfo?.cpu_limit.used /
												waxAccountInfo?.cpu_limit.max) *
											100
										}
										strokeWidth={12}
										styles={{
											path: {
												// Path color
												stroke: `#5338A9`,
											},
										}}>
										<div style={{ fontSize: "2rem" }}>
											<strong>
												{(
													(waxAccountInfo?.cpu_limit.used /
														waxAccountInfo?.cpu_limit.max) *
													100
												).toFixed(2)}
												%
											</strong>
										</div>
										<div style={{ fontSize: "1.1rem" }}>
											<strong>used</strong>
										</div>
									</CircularProgressbarWithChildren>
								</div>
								<div className='modal-resource-header'>CPU</div>
								<div className='modal-resource-detail'>
									{(waxAccountInfo?.cpu_limit.used / 1024).toFixed(2)}
									ms/
									{(waxAccountInfo?.cpu_limit.max / 1024).toFixed(2)}
									ms
								</div>
								<div className='modal-resource-detail'>
									Total Staked:{' '}
									{parseFloat(
										waxAccountInfo?.total_resources.cpu_weight.split(' ')[0]
									)}{' '}
									WAX
								</div>
							</div>
							<div className='modal-circular-group'>
								<div className='circular-progress'>
									<CircularProgressbarWithChildren
										value={
											(waxAccountInfo?.net_limit.used /
												waxAccountInfo?.net_limit.max) *
											100
										}
										strokeWidth={12}
										styles={{
											path: {
												// Path color
												stroke: `#4F8C38`,
											},
										}}>
										<div style={{ fontSize: "2rem" }}>
											<strong>
												{(
													(waxAccountInfo?.net_limit.used /
														waxAccountInfo?.net_limit.max) *
													100
												).toFixed(2)}
												%
											</strong>
										</div>
										<div style={{ fontSize: "1.1rem" }}>
											<strong>used</strong>
										</div>
									</CircularProgressbarWithChildren>
								</div>
								<div className='modal-resource-header'>NET</div>
								<div className='modal-resource-detail'>
									{parseInt(waxAccountInfo?.net_limit.used / 1024)}
									Kb/
									{parseInt(waxAccountInfo?.net_limit.max / 1024)}
									Kb
								</div>
								<div className='modal-resource-detail'>
									Total Staked:{' '}
									{parseFloat(
										waxAccountInfo?.total_resources.net_weight.split(' ')[0]
									).toFixed(2)}{' '}
									WAX
								</div>
							</div>
							<div className='modal-circular-group'>
								<div className='circular-progress'>
									<CircularProgressbarWithChildren
										value={
											(waxAccountInfo?.ram_usage / waxAccountInfo?.ram_quota) *
											100
										}
										strokeWidth={12}
										styles={{
											path: {
												// Path color
												stroke: `#F178B6`,
											},
										}}>
										<div style={{ fontSize: "2rem" }}>
											<strong>
												{(
													(waxAccountInfo?.ram_usage /
														waxAccountInfo?.ram_quota) *
													100
												).toFixed(2)}
												%
											</strong>
										</div>
										<div style={{ fontSize: "1.1rem" }}>
											<strong>used</strong>
										</div>
									</CircularProgressbarWithChildren>
								</div>
								<div className='modal-resource-header'>RAM</div>
								<div className='modal-resource-detail'>
									{parseInt(waxAccountInfo?.ram_usage / 1024)}
									Kb/
									{parseInt(waxAccountInfo?.ram_quota / 1024)}
									Kb
								</div>
							</div>
						</div>
						<div className='modal-stake-input'>
							<select
								value={resourceType || 'CPU'}
								onChange={(e) => setResourceType(e.target.value)}>
								<option value='CPU'>CPU</option>
								<option value='RAM'>RAM</option>
								<option value='NET'>NET</option>
							</select>

							<div className='input-wrapper'>
								<input
									type='number'
									placeholder='Amount of wax'
									value={lackingValue}
									onChange={(e) => setLackingValue(e.target.value)}
									min={0}
									max={parseFloat(
										waxAccountInfo?.core_liquid_balance?.split(' ')[0]
									).toFixed(8)}
									className='input-stake'
								/>
								<button
									className='btn-stake'
									onClick={(e) => handleClickStake()}>
									{' '}
									Stake
								</button>
							</div>
						</div>
					</div>
					<div className='modal-stake-footer'>
						CPU and NET automatically recover every 24 hours. When you don't
						need CPU or NET, you can unstake WAX later
					</div>
				</div>
			</div>
		</React.Fragment>,
		document.body
	);
}
