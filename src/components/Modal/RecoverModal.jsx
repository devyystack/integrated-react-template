/** @format */

// import "./index.scss"

import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

import Button from '../Button/Button';

import energyicon from '../../static/icons/energy-icon.png';
import minusicon from '../../static/icons/minus.png';
import plusicon from '../../static/icons/plus.png';
import plainOxygen from '../../static/icons/Oxygen.png';
import plainEnergy from '../../static/icons/energy-icon.png';
import closeButton from '../../static/icons/close-button.png';
import energyBar from '../../static/img/addenergy/energy-bar.png';

import { useSelector, useDispatch } from 'react-redux';
import {
	cancelLoading,
	setBackgroundUpdate,
} from '../../redux/slice/GameSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import {
	recover,
	UpdateHealth,
	updateBalance,
} from '../../redux/slice/userSlicer';
import InformModal from './InformModal';
import { setFlash } from '../../redux/slice/FlashSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
const ExchangeModal = ({ isShowing, hide }) => {
	const [changeEnergy, setChangeEnergy] = useState(0);
	const [max, setMax] = useState(0);
	const user = useSelector((state) => state.user.info);
	const oxygen = useSelector((state) => state.user.balances.oxygen) || 0;
	useEffect(() => {
		if ((user?.max_energy - user?.energy) / 10 <= oxygen)
			setMax(user?.max_energy - user?.energy);
		else setMax(oxygen * 10);
	}, [user, oxygen]);
	const dispatch = useDispatch();
	const HandleExchange = async () => {
		try {
			dispatch(cancelLoading(false));
			if (isExchangable !== 'disabled') {
				const oxygenConsumed = changeEnergy / 10;
				const resultAction = await dispatch(recover(oxygenConsumed)).unwrap();
				if (resultAction?.transaction_id !== null) {
					const flash_id = Date.now();
					const flashMessage = {
						id: flash_id,
						content: `Eating your ${oxygenConsumed} oxygen`,
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage));
					dispatch(UpdateHealth({ type: 'plus', value: changeEnergy }));
					dispatch(updateBalance(`-${oxygenConsumed} oxygen`));
					dispatch(setBackgroundUpdate(true));
				}
			} else {
				dispatch(toggleModal(true));
				dispatch(setErrorMessage('You can not exchange stuff like this!'));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			dispatch(setBackgroundUpdate(true));
		} finally {
			setChangeEnergy(0);
			hide();
		}
	};
	const HandleChange = (e) => {
		if (e.target.value <= 0) setChangeEnergy(0);
		else if (e.target.value >= max) setChangeEnergy(max);
		else setChangeEnergy(e.target.value);
		e.preventDefault();
	};
	const refOutside = useRef(null);
	const handleClickOutside = (event) => {
		if (refOutside.current && !refOutside.current.contains(event.target)) {
			hide();
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	});
	const isExchangable = changeEnergy !== 0 ? '' : 'disabled';

	return isShowing
		? ReactDOM.createPortal(
				<React.Fragment>
					<InformModal />
					<div
						className='modal-wrapper'
						aria-modal
						aria-hidden
						tabIndex={-1}
						role='dialog'>
						<div className='modal44 exchange-modal' ref={refOutside}>
							<div className='modal-header'>
								<img
									src={energyBar}
									alt='Energy Icon'
									style={{ width: '6.6rem', height: '21.5rem', position: 'absolute', top: '142%', left: '-311%' }}
								/>
								<img
									src={closeButton}
									alt='Close'
									style={{ width: '3rem', height: '3rem', position: 'relative', top: '171%', left: '691%' }}
									className='image-button close-modal'
									onClick={hide}
								/>
							</div>
							<div className='modal-body'>
								<img
									src={minusicon}
									alt='Minus Icon'
									value={changeEnergy}
									onClick={() =>
										setChangeEnergy(changeEnergy <= 10 ? 0 : changeEnergy - 10)
									}
									className='image-button'
								/>
								<input
									type='number'
									min={0}
									max={max}
									className='modal-input'
									// style={{ backgroundImage: "url(./img/arrow-bar.png)" }}
									value={changeEnergy}
									onChange={(e) => HandleChange(e)}
								/>

								<img
									src={plusicon}
									alt='Plus Icon'
									onClick={() =>
										setChangeEnergy(
											changeEnergy + 10 <= max ? changeEnergy + 10 : max
										)
									}
									className='image-button'
								/>
							</div>
							<div className='modal-close-button tooltip' style={{width: '37%', position: 'absolute', top: '43%', left: '41%'}}>
								<Button
									type='button'
									data-dismiss='modal'
									text='EXCHANGE'
									atr='long'
									wrapperClassname='full-width'
									isDisabled={isExchangable}
									handleClick={HandleExchange}
								/>
								{isExchangable === 'disabled' && (
									<span className='tooltiptext tooltip-bottom'>
										<i className='arrow-up'></i>Enter a Valid Amount
									</span>
								)}
							</div>
							<div className='modal-footer'>
								<div className='modal-footer-text'>{changeEnergy / 10 || 1}</div>
								<img
									src={plainOxygen}
									alt='Oxygen Icon'
									className='exchange-icon'
								/>
								<div style={{ padding: '0 2px' }}>=</div>
								<div className='modal-footer-text'>{changeEnergy || 10 + ' energy'}</div>

								{/* <img            // updated by
									src={plainEnergy}
									alt='Energy Icon'
									className='exchange-icon'
								/> */}
							</div>
						</div>
					</div>
				</React.Fragment>,
				document.body
		  )
		: null;
};
export default ExchangeModal;
