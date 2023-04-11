/** @format */

import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from '../Button/Button';

// import './index.scss'
import { useSelector, useDispatch } from 'react-redux';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import {
	setBackgroundUpdate,
	setClearAsset,
} from '../../redux/slice/GameSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
import { mbsClaimAsset } from '../../redux/slice/BadgeSlicer';
const ClaimMembership = () => {
	const dispatch = useDispatch();
	const claimAssets = useSelector((state) => state.game.claimAssets);
	const isShowing = claimAssets.length > 0;
	const handleClaimAsset = async () => {
		try {
			const response = await dispatch(mbsClaimAsset(false)).unwrap();
			if (response) {
				dispatch(setErrorMessage(`You get your Membership successfully!`));
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(setBackgroundUpdate(true));
		}
	};

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

	return (
		isShowing &&
		ReactDOM.createPortal(
			<React.Fragment>
				<div className='modal-wrapper' tabIndex={-1} role='dialog'>
					<div
						style={{ backgroundImage: 'url(./img/big-board.png)' }}
						className='modal44'
						ref={refOutside}>
						<div className='modal-content mid'>
							You are having {claimAssets.length} Membership stuck in Galaxyminers. Do you want to take it?
						</div>
						<div className='modal__button-group token'>
							<Button
								type='button'
								atr='short'
								data-dismiss='modal'
								text='Accept'
								handleClick={() => handleClaimAsset()}
							/>
							<Button
								type='button'
								atr='short'
								data-dismiss='modal'
								text='Cancel'
								handleClick={() => dispatch(setClearAsset())}
							/>
						</div>
					</div>
				</div>
			</React.Fragment>,
			document.body
		)
	);
};
export default ClaimMembership;
