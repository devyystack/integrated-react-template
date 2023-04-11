/** @format */

import React, { useState, useEffect, useRef } from 'react';
import closeButton from '../../assets/img/close-button.png';
import { useSelector, useDispatch } from 'react-redux';
import { marketBuy } from '../../redux/slice/MarketSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { cancelLoading, setUpdate } from '../../redux/slice/GameSlicer';
import { setFlash } from '../../redux/slice/FlashSlicer';
import { selectBalances } from '../../redux/slice/userSlicer';

import getErrorMessages from '../../utils/getErrorMessages';

const serverIMG = 'https://ipfs.io/ipfs/';

export default function MarketItemList(props) {
	const balances = useSelector(selectBalances);
	const balancePlasma = parseFloat(balances?.plasma);
	const ref = useRef(null);
	const [choosingItem, setChoosingItem] = useState(0);
	const [quantity, setQuantity] = useState(
		balancePlasma > props.data[choosingItem].price ? 1 : 0
	);
	const [downMarket, setDownMarket] = useState();

	const dispatch = useDispatch();
	const handleChangeQuantity = (value) => {
		setQuantity(parseInt(value));
	};

	const isAfforable = quantity > 0 ? true : 'disabled';
	const [price, setPrice] = useState(0);

	useEffect(() => {
		if (quantity) {
			setPrice(quantity * props.data[choosingItem].price);
		} else {
			setPrice(0);
		}
	}, [quantity, choosingItem, props.data]);

	const handleBuy = async () => {
		try {
			dispatch(cancelLoading(false));
			if (isAfforable !== 'disabled') {
				const data = {
					quantity: quantity,
					template_id: props.data[choosingItem].template_id,
				};

				const resultAction = await dispatch(marketBuy(data)).unwrap();

				if (resultAction?.transaction_id !== null) {
					const flash_id = Date.now();
					const flashMessage = {
						id: flash_id,
						content: `Buying ${props.data[choosingItem].name}`,
						timeout: 5000,
					};
					dispatch(setFlash(flashMessage));
				}
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(setUpdate(true));
		}
	};

	const handleClose = () => {
		setDownMarket('market-container-down');
		setTimeout(() => {
			props.handleClose();
		}, 350);
	};

	const handleChooseItem = (i) => {
		setChoosingItem(i);

		if (balancePlasma > parseFloat(props.data[i].price)) {
			setQuantity(1);
		} else {
			setQuantity(0);
		}
	};

	const handleAddItem = () => {
		if (
			balancePlasma >
			(quantity + 1) * parseFloat(props.data[choosingItem].price)
		) {
			setQuantity(quantity + 1);
		} else {
			dispatch(setErrorMessage('Your plasma balance is not enough!'));
			dispatch(toggleModal(true));
		}
	};

	return (
		<>
			<section className={`market-container ${downMarket}`} ref={ref}>
				<div
					className='cows-market__header--tilte'
					style={{ backgroundImage: 'url(./img/border-button.png)' }}>
					Market
				</div>
				<img
					src={closeButton}
					alt='Close'
					className='close-market-modal image-button'
					onClick={() => handleClose()}
				/>
				<div
					className='market-item__wrapper'
					style={{ backgroundImage: 'url(/img/market-paper.png)' }}>
					<div className='market-item'>
						<img
							src={serverIMG + props.data[choosingItem].img}
							className='market-item__img'
							alt='sale'
						/>
					</div>
					<div className='market-input-container'>
						<img
							src='/img/minus.png'
							alt='minus'
							onClick={() => setQuantity(quantity - 1 >= 0 ? quantity - 1 : 0)}
							className='market-input--img'
						/>
						<input
							type='number'
							min={1}
							value={quantity}
							onChange={(e) => handleChangeQuantity(e.target.value)}
							className='market-input'
						/>
						<img
							src='/img/plus.png'
							alt='plus'
							// onClick={() => setQuantity(quantity + 1)}
							onClick={() => handleAddItem()}
							className='market-input--img'
						/>
					</div>
					<div className='market-btn__wrapper'>
						<button className='buy-btn__wrapper' onClick={() => handleBuy()}>
							<span>{price}</span>
							<img src='/img/plain-plasma-icon.png' alt='' />
						</button>
					</div>
					<div className='market-update__wrapper'>
						Market is updated at 00:00 UTC every Sunday.
					</div>
				</div>
				<div className='market-list__wrapper'>
					{props.data?.map((item, i) => (
						<div className='market-item' key={i}>
							<div className='market-item__img'>
								{item?.charge_time && (
									<div className='market-note tooltip'>
										<div className='market-note__content tooltiptext tooltip-bottom'>
											<div className='note-title'>
												<div className='note-title__name'>{item.name}</div>
											</div>
											<div className='note-content '>
												<div className='note-content-info-label'>
													<span>Charge Time</span>
													<div className='info-description'>
														{item.charge_time}
													</div>
												</div>
												<div className='note-content-info-label'>
													<span>Energy Consumed</span>
													<div className='info-description'>
														{item.energy_consumed}
													</div>
												</div>

												<div className='note-content-info-label'>
													<span>Required Claim</span>
													<div className='info-description'>
														{item.required_claims}
													</div>
												</div>
											</div>
										</div>
										<img
											className='market-note__button image-button'
											src='/img/note-icon.png'
											alt='info'
										/>
									</div>
								)}
								<img
									onClick={() => handleChooseItem(i)}
									src={serverIMG + item.img}
									alt={i}
									className={
										i === choosingItem
											? 'market-item__img active'
											: 'market-item__img'
									}
								/>
							</div>
							<div className='market-item__price'>
								<span>{item.price}</span>
								<img src='/img/plain-plasma-icon.png' alt='plasma' />
							</div>
						</div>
					))}
				</div>
			</section>
			<div className='click-out-side' onClick={() => handleClose()} />
		</>
	);
}
