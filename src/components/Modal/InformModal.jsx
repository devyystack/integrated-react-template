/** @format */

import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactDOM from 'react-dom';
import { toggleModal } from '../../redux/slice/modalSlice';
import Button from '../Button/Button';

const InformModal = () => {
	const dispatch = useDispatch();
	const isShowing = useSelector((state) => state.modal.isShowing);
	const error = useSelector((state) => state.modal.error);

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

	const calMid = () => {
		if (error.length < 250) {
			return 'mid';
		}
	};

	return isShowing
		? ReactDOM.createPortal(
				<React.Fragment>
					<div className='modal-wrapper' tabIndex={-1} role='dialog'>
						<div className='modal44' ref={refOutside}>
							{/* <div>INFO</div> */}
							<div className={`modal-content ` + calMid()} style={{backgroundColor: '#000'}}>{`${error}`}</div>
							<div className='modal__button-group'>
								<Button
									type='button'
									atr='short'
									wrapperClassname='full-width'
									data-dismiss='modal'
									text='OK'
									handleClick={() => dispatch(toggleModal(false))}
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
