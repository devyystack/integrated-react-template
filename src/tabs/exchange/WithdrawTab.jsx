/** @format */

import React from 'react';
import { setErrorMessage, toggleModal } from '../../redux/slice/modalSlice';

import { useSelector, useDispatch } from 'react-redux';
import {
	selectTabData,
	withdraw,
	resetChange,
	getConfigs,
} from './exchangeSlice';
import { cancelLoading, setUpdate } from '../../redux/slice/GameSlicer';

import ExchangeInput from './ExchangeInput';
import Button from '../../components/Button/Button';
import ExchangeBalance from './ExchangeBalance';

import plainOxygen from '../../static/icons/oxygen-icon.png';
import plainAsteroid from '../../static/icons/asteroid-icon.png';
import plainPlasma from '../../static/icons/plasma-icon.png';
import plasmaTypeIcon from '../../static/icons/Plasma.png';
import asteroidTypeIcon from '../../static/icons/Asteroid.png';
import oxygenTypeIcon from '../../static/icons/Oxygen.png';
import getErrorMessages from '../../utils/getErrorMessages';

const exchangeIcons = [
	plainPlasma,
	plainAsteroid,
	plainOxygen,
	plasmaTypeIcon,
	asteroidTypeIcon,
	oxygenTypeIcon,
];
export default function WithdrawTab() {
	const balances = useSelector((state) => state.user.balances);
	const exchangeData = useSelector((state) => selectTabData(state.exchange));
	const tax = useSelector((state) => state.exchange.tax);
	const isDisabled =
		exchangeData.asteroid > 0 || exchangeData.plasma > 0 || exchangeData.oxygen > 0
			? null
			: 'disabled';

	const dispatch = useDispatch();
	const handleWithdraw = async () => {
		await dispatch(getConfigs());
		try {
			dispatch(cancelLoading(false));

			if (isDisabled !== 'disabled') {
				const resultAction = await dispatch(
					withdraw({ ...exchangeData, fee: tax })
				).unwrap();
				if (resultAction?.transaction_id !== null) {
					dispatch(setUpdate(true));
					dispatch(setErrorMessage('Transaction done successfully'));
					dispatch(toggleModal(true));
					dispatch(resetChange());
				}
			} else {
				dispatch(setErrorMessage('Nothing selected to withdraw'));
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			dispatch(setUpdate(true));
		}
	};
	// const calculateTimeLeft = () => {
	//     const event = new Date();

	//     event.setHours(event.getHours() + 1, 0, 0, 0);

	//     let newTime = event - Date.now()
	//     if (newTime < 0)
	//         newTime = 0
	//     setCount(newTime)
	// }
	// useEffect(() => {
	//     let timer1 = setTimeout(() => {
	//         calculateTimeLeft();
	//     }, 100)
	//     return () => { clearTimeout(timer1) }
	// });

	// const hours = Math.floor(currentCount / (3600 * 1000)) || 0
	// const minutes = Math.floor(currentCount % (3600 * 1000) / 60000) || 0
	// const seconds = Math.floor(currentCount / 1000 - (hours * 3600 + minutes * 60)) || 0
	// const timeStr = '' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds)

	return (
		<div className='withdrawTab-container'>
			<div className='withdraw-tax'>
				<div className='withdraw-tax-tag'>FEE: {tax}%</div>
				{/* <div className='withdraw-tax-text'>       // updated by
					New fee in {timeStr}
					Fee will be updated every hour
				</div> */}
			</div>
			<div className='exchange-container'>
				<div className='exchange-content'>
					<div className='exchange-group'>
						<div className='exchange-content-title'>Resource balance:</div>
						<ExchangeBalance
							resource={balances?.plasma}
							image={exchangeIcons[0]}
						/>
						<ExchangeBalance
							resource={balances?.asteroi}  // updated by    original: asteroid
							image={exchangeIcons[1]}
						/>
						<ExchangeBalance
							resource={balances?.oxygen}
							image={exchangeIcons[2]}
						/>
					</div>
					<div className='exchange-group'>
						<div className='exchange-content-title'>Withdrawal amount:</div>
						<ExchangeInput
							exchangeValue={exchangeData.plasma}
							initialResource={balances?.plasma || 0}
							image={exchangeIcons[0]}
							resource='plasma'
							type='straight'
						/>
						<ExchangeInput
							exchangeValue={exchangeData.asteroid}
							initialResource={balances?.asteroi || 0}
							image={exchangeIcons[1]}
							resource='asteroid'
							type='straight'
						/>
						<ExchangeInput
							exchangeValue={exchangeData.oxygen}
							initialResource={balances?.oxygen || 0}
							image={exchangeIcons[2]}
							resource='oxygen'
							type='straight'
						/>
					</div>
					<div className='exchange-group'>
						<div className='exchange-content-title'>Total Tokens:</div>
						<ExchangeInput
							exchangeValue={exchangeData.plasma}
							initialResource={balances?.plasma || 0}
							image={exchangeIcons[3]}
							resource='GMP'
							type='reverse'
						/>
						<ExchangeInput
							exchangeValue={exchangeData.asteroid}
							initialResource={balances?.asteroi || 0}
							image={exchangeIcons[4]}
							resource='GMA'
							type='reverse'
						/>
						<ExchangeInput
							exchangeValue={exchangeData.oxygen}
							initialResource={balances?.oxygen || 0}
							image={exchangeIcons[5]}
							resource='GMO'
							type='reverse'
						/>
					</div>
				</div>
				<div className='withdraw-button tooltip'>
					<Button
						text='EXCHANGE'
						handleClick={handleWithdraw}
						atr='long'
						isDisabled={isDisabled}
						wrapperClassname='full-width'
					/>
					{isDisabled === 'disabled' && (
						<span className='tooltiptext tooltip-bottom'>
							<i className='arrow-up'></i>Empty withdraw amount
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
