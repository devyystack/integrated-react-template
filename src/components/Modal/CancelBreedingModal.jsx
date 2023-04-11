/** @format */

import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from '../Button/Button';

// import './index.scss'
import { useDispatch } from 'react-redux';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import getErrorMessages from '../../utils/getErrorMessages';
import { setFlash } from '../../redux/slice/FlashSlicer';
import {
	cancelLoading,
	setBackgroundUpdate,
} from '../../redux/slice/GameSlicer';
import { cancelBreeding } from '../../redux/slice/BreedingSlicer';
import { deleteFlash } from '../../redux/slice/FlashSlicer';

const CancelBreedingModal = ({
	HandleCancel,
	cowMale,
	cowFemale,
	handelCowMale,
	handelCowFeMale,
	handleCowBreeding,
}) => {
	const dispatch = useDispatch();
	const ref = useRef(null);
	const handleClickOutside = (event) => {
		if (ref.current && !ref.current.contains(event.target)) {
			HandleCancel();
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	});

	const handleCancelBreeding = async () => {
		const flash_id = Date.now();
		try {
			const flashMessage = {
				id: flash_id,
				content: `Canceling breeding your ${cowMale?.name} and ${cowFemale?.name}`,
				timeout: 30000,
			};
			dispatch(setFlash(flashMessage));
			await dispatch(cancelBreeding(cowFemale?.asset_id)).unwrap();
			await HandleCancel();
			await dispatch(cancelLoading(false));
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(deleteFlash(flash_id));
			dispatch(setBackgroundUpdate(true));
		}
	};

	return ReactDOM.createPortal(
		<React.Fragment>
			<div className='modal-wrapper' tabIndex={-1} role='dialog'>
				<div className='modal44' ref={ref}>
					<div className='modal-content mid'>
						Do you want to cancel this breeding?
					</div>
					<div className='modal__button-group token'>
						<Button
							type='button'
							atr='short'
							wrapperClassname='full-width'
							data-dismiss='modal'
							text='Accept'
							handleClick={handleCancelBreeding}
						/>
						<Button
							type='button'
							atr='short'
							wrapperClassname='full-width'
							data-dismiss='modal'
							text='Cancel'
							handleClick={HandleCancel}
						/>
					</div>
				</div>
			</div>
		</React.Fragment>,
		document.body
	);
};
export default CancelBreedingModal;
