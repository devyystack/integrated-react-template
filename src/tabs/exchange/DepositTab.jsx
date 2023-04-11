/** @format */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTabData, deposit, resetChange } from './exchangeSlice';
import { setErrorMessage, toggleModal } from '../../redux/slice/modalSlice';

import ExchangeInput from './ExchangeInput';

import Button from '../../components/Button/Button';
import ExchangeBalance from './ExchangeBalance';
import { cancelLoading, setUpdate } from '../../redux/slice/GameSlicer';

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
export default function DepositTab() {
	const tokens = useSelector((state) => state.exchange.tokens);
	const exchangeData = useSelector((state) => selectTabData(state.exchange));

	const isDisabled =
		exchangeData.asteroid > 0 || exchangeData.plasma > 0 || exchangeData.oxygen > 0
			? null
			: 'disabled';
	const isZeroTokens = !(tokens?.GMO > 0 || tokens?.GMA > 0 || tokens?.GMP > 0);
	const dispatch = useDispatch();
	const handleDeposit = async () => {
		try {
			dispatch(cancelLoading(false));

			if (isDisabled !== 'disabled') {
				const resultAction = await dispatch(
					deposit({ ...exchangeData })
				).unwrap();
				if (resultAction?.transaction_id !== null) {
					dispatch(setUpdate(true));
					dispatch(setErrorMessage('Transaction done successfully'));
					dispatch(toggleModal(true));
					dispatch(resetChange());
				}
			} else {
				if (isZeroTokens)
					dispatch(
						setErrorMessage('Looks like you dont own any tokens to deposit.')
					);
				else dispatch(setErrorMessage('You should enter positive values'));
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			dispatch(setUpdate(true));
		}
	};
	return (
		<div className='withdrawTab-container'>
			{/* <div className="withdraw-tax">
                <div className="withdraw-tax-tag">
                    Tax:30%
                </div>
                <div className="withdraw-tax-text">
                    New tax in 00:24:06
                </div>
            </div> */}
			<div className='exchange-container' style={{marginTop: '19%'}}>
				<div className='exchange-content'>
					<div className='exchange-group'>
						<div className='exchange-content-title'>Token balance:</div>
						<ExchangeBalance
							resource={tokens?.GMP}
							image={exchangeIcons[3]}
							type={'GMP'}
						/>
						<ExchangeBalance
							resource={tokens?.GMA}
							image={exchangeIcons[4]}
							type={'GMA'}
						/>
						<ExchangeBalance
							resource={tokens?.GMO}
							image={exchangeIcons[5]}
							type={'GMO'}
						/>
					</div>
					<div className='exchange-group'>
						<div className='exchange-content-title'>Deposit amount:</div>
						<ExchangeInput
							exchangeValue={exchangeData.plasma}
							initialResource={tokens?.GMP}
							image={exchangeIcons[3]}
							resource='GMP'
							type='straight'
						/>
						<ExchangeInput
							exchangeValue={exchangeData.asteroid}
							initialResource={tokens?.GMA}
							image={exchangeIcons[4]}
							resource='GMA'
							type='straight'
						/>
						<ExchangeInput
							exchangeValue={exchangeData.oxygen}
							initialResource={tokens?.GMO}
							image={exchangeIcons[5]}
							resource='GMO'
							type='straight'
						/>
					</div>
					<div className='exchange-group'>
						<div className='exchange-content-title'>Total resources:</div>
						<ExchangeInput
							exchangeValue={exchangeData.plasma}
							initialResource={tokens?.GMP}
							image={exchangeIcons[0]}
							resource='plasma'
							type='straight'
						/>
						<ExchangeInput
							exchangeValue={exchangeData.asteroid}
							initialResource={tokens?.GMA}
							image={exchangeIcons[1]}
							resource='asteroid'
							type='straight'
						/>
						<ExchangeInput
							exchangeValue={exchangeData.oxygen}
							initialResource={tokens?.GMO}
							image={exchangeIcons[2]}
							resource='oxygen'
							type='straight'
						/>
					</div>
				</div>
				<div className='withdraw-button tooltip'>
					<Button
						text='EXCHANGE'
						handleClick={handleDeposit}
						atr='long'
						isDisabled={isDisabled}
						wrapperClassname='full-width'
					/>

					{isDisabled === 'disabled' && (
						<span className='tooltiptext tooltip-bottom'>
							<i className='arrow-up'></i>Please enter deposit amount{' '}
						</span>
					)}
					{/* <span className="tooltiptext tooltip-bottom"><i className="arrow-up"></i>You have to enter Deposit amount to Deposit </span> */}
				</div>
			</div>
		</div>
	);
}
