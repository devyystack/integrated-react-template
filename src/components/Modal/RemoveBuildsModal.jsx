/** @format */

import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from '../Button/Button';

// import './index.scss'
import { useDispatch } from 'react-redux';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { setSelectedMap, setUpdate } from '../../redux/slice/GameSlicer';
import { removeItem } from '../../redux/slice/ToolsSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
import { setFlash } from '../../redux/slice/FlashSlicer';

const RemoveBuildsModal = ({ HandleCancel, type, name, asset_id }) => {
	const dispatch = useDispatch();
	const refOutside = useRef(null);
	const handleClickOutside = (event) => {
		if (refOutside.current && !refOutside.current.contains(event.target)) {
			HandleCancel();
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	});

	const handleRemove = async () => {
		try {
			await dispatch(removeItem(asset_id)).unwrap();
			const flash_id = Date.now();
			const flashMessage = {
				id: flash_id,
				content: `Removing your ${name}`,
				timeout: 5000,
			};
			dispatch(setFlash(flashMessage));
			if (type) {
				dispatch(setSelectedMap(0));
			}
			HandleCancel();
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(setUpdate(true));
		}
	};

	return ReactDOM.createPortal(
		<React.Fragment>
			<div className='modal-wrapper' tabIndex={-1} role='dialog'>
				<div className='modal44' ref={refOutside}>
					<div className='modal-content mid'>
						Do you want to remove this {name}? All your hard work on this {name}{' '}
						will be lost.
					</div>
					<div className='modal__button-group token'>
						<Button
							type='button'
							atr='short'
							wrapperClassname='full-width'
							data-dismiss='modal'
							text='Accept'
							handleClick={handleRemove}
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
export default RemoveBuildsModal;
