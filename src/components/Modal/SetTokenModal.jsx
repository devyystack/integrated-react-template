/** @format */

import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from '../Button/Button';

// import './index.scss'
import { useSelector, useDispatch } from 'react-redux';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import {
	cancelLoading,
	setBackgroundUpdate,
	setTokenModal,
	setAccountToken,
} from '../../redux/slice/GameSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
const InformModal = () => {
	const dispatch = useDispatch();
	const isSetToken = useSelector((state) => state.game.isSetToken);
	const refOutside = useRef(null);
	const handleClickOutside = (event) => {
		if (refOutside.current && !refOutside.current.contains(event.target)) {
			dispatch(toggleModal(false));
		}
	};

	useEffect(() => {
		document.addEventListener('click', handleClickOutside, true);
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	});

	const handleSetToken = async () => {
		try {
			dispatch(cancelLoading(false));
			await dispatch(setAccountToken()).unwrap();
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);

			dispatch(toggleModal(true));
			dispatch(setBackgroundUpdate(true));
		}
	};

	return !isSetToken
		? ReactDOM.createPortal(
				<React.Fragment>
					<div className='modal-wrapper' tabIndex={-1} role='dialog'>
						<div className='modal44' ref={refOutside}>
							<div className='modal-content mid'>
								Do you want to add GalaxyMiners Tokens to your Wax Cloud Wallet
								now?
							</div>
							<div className='modal__button-group token'>
								<Button
									type='button'
									atr='short'
									wrapperClassname='full-width'
									data-dismiss='modal'
									text='Accept'
									handleClick={() => handleSetToken()}
								/>
								<Button
									type='button'
									atr='short'
									wrapperClassname='full-width'
									data-dismiss='modal'
									text='Cancel'
									handleClick={() => dispatch(setTokenModal(true))}
								/>
							</div>
						</div>
					</div>
				</React.Fragment>,
				document.body
		  )
		: null;
};
export default InformModal;
