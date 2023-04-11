/** @format */

import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from '../Button/Button';
import closeButton from '../../assets/img/close-button.png';
import { useSprings, animated, to } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { useDispatch, useSelector } from 'react-redux';

import {
	cancelLoading,
	setBackgroundUpdate,
} from '../../redux/slice/GameSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';

import { deleteFlash, setFlash } from '../../redux/slice/FlashSlicer';
import getErrorMessages from '../../utils/getErrorMessages';
import { feedBreeding, startBreeding } from '../../redux/slice/BreedingSlicer';
import ProgressBar from '../ProgressBar/ProgressBar';
import { getChestAssetsByTemplate } from '../../redux/slice/AtomicSlicer';
import { getTransaction } from '../../redux/slice/AnimalsSlicer';
import CancelBreedingModal from '../Modal/CancelBreedingModal';

const serverIMG = 'https://ipfs.io/ipfs/';

export default function CowBreeding(props) {
	const finalRef = useRef();
	const finalRefs = useRef();
	const [isCountDown, setCountdown] = useState(true);

	const breedings = useSelector((state) => state.breeding.breedings);

	const [cowMale, setCowMale] = useState(null);
	const [cowFemale, setCowFemale] = useState(null);

	const [cowBreeding, setCowBreeding] = useState(false);
	const [downBreeding, setDownBreeding] = useState();
	const [modalShowing, setModalShowing] = useState(false);

	const [cowData, setCowData] = useState(props.data);

	const breedingConfig = useSelector((state) => state.breeding.breedingConfig);
	const oxygenList = useSelector((state) =>
		getChestAssetsByTemplate(
			state.atomic.oxygens,
			breedingConfig[0].consumed_card + ''
		)
	);

	const dispatch = useDispatch();

	const isOxygen = oxygenList?.length > 0;
	const isPair = cowMale && cowFemale;
	const breedText = isPair
		? isCountDown === true
			? isOxygen
				? 'Breed'
				: 'No Oxygen'
			: 'Countdown'
		: 'No Pair';
	const isBreedable = breedText === 'Breed' || 'disabled';
	const isCancelable =
		(breedings.length >= 1 && isPair && isCountDown === true) || 'disabled';

	useEffect(() => {
		setCowData(props.data);
		if (props.cowBreeding.length > 0 && props.cowBreeding.length <= 2) {
			setCowBreeding(true);
			props.cowBreeding.forEach((item) => {
				if (item.gender === 1) {
					setCowMale(item);
				} else if (item.gender === 2) {
					setCowFemale(item);
				}
			});
		} else {
			setCowBreeding(false);
			setCowMale(null);
			setCowFemale(null);
		}
	}, [props.cowBreeding, breedings, props.data]);

	useEffect(() => {
		setCountdown(
			Date.now() - (breedings[0]?.next_availability || 0) * 1000 >= 0 ||
				'disabled'
		);
		return () => {
			setCountdown(true);
		};
	}, [breedings]);

	const handleBreed = () => {
		if (breedings.length >= 1) {
			handleClaimBreed();
		} else {
			handleStartBreed();
		}
	};

	const handleStartBreed = async () => {
		const flash_id = Date.now();
		try {
			dispatch(cancelLoading(false));
			const flashMessage = {
				id: flash_id,
				content: `Start Breeding your ${cowMale.name} and ${cowFemale.name} `,
				timeout: 30000,
			};
			dispatch(setFlash(flashMessage));
			const data = {
				dad: cowMale.asset_id,
				mother: cowFemale.asset_id,
			};
			const resultAction = await dispatch(startBreeding(data)).unwrap();
			if (resultAction.transaction_id) {
				const inform =
					'Pairing your Bull and Dairy Cow successfully. After this Countdown, you can breed them!';
				dispatch(setErrorMessage(inform));
				dispatch(toggleModal(true));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(deleteFlash(flash_id));
			dispatch(setBackgroundUpdate(true));
		}
	};

	const handleClaimBreed = async () => {
		const flash_id = Date.now();
		try {
			dispatch(cancelLoading(false));
			if (isBreedable !== 'disabled') {
				const flashMessage = {
					id: flash_id,
					content: `Breeding your ${cowMale.name} and ${cowFemale.name} `,
					timeout: 30000,
				};
				dispatch(setFlash(flashMessage));
				const data = {
					dad: cowMale.asset_id,
					mother: cowFemale.asset_id,
					oxygen: oxygenList,
				};
				const resultAction = await dispatch(feedBreeding(data)).unwrap();
				if (resultAction.transaction_id) {
					const flashMessage2 = {
						id: flash_id,
						content: `Successfull breeding`,
						timeout: 1500,
					};
					dispatch(setFlash(flashMessage2));
					if (
						breedings[0] &&
						breedings[0]?.times_claimed + 1 >= breedingConfig[0].required_claims
					) {
						const result = await dispatch(
							getTransaction(resultAction.transaction_id)
						).unwrap();
						if (result.claim) {
							const inform =
								"You've just harvested " + result.claim.quantity + ' Baby Caft';
							dispatch(setErrorMessage(inform));
						} else {
							dispatch(setErrorMessage('You got your rewards'));
						}
						dispatch(toggleModal(true));
					}
				}
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(deleteFlash(flash_id));
			dispatch(setBackgroundUpdate(true));
		}
	};
	const handleCancel = async () => {
		if (isCancelable !== 'disabled') {
			setModalShowing(true);
		}
	};

	const too = (i) => ({
		x: 0,
		y: 0,
		scale: 1,
	});
	const from = (i) => ({ x: 0, rot: 0, scale: 1, y: 0 });

	const [propsPos, api] = useSprings(cowData.length, (i) => ({
		...too(i),
		from: from(i),
	}));

	const bind = useDrag(({ args: [index], tap }) => {
		let cowChoosePos;
		let malePos;
		let femalePos;
		let x;
		let y;
		let scale;

		if (tap) {
			const init = document.getElementById(`cows-select-${index}`);

			if (init != null) {
				cowChoosePos = init.getBoundingClientRect();
			}
			if (finalRef.current && finalRefs.current) {
				malePos = finalRef.current.getBoundingClientRect();

				femalePos = finalRefs.current.getBoundingClientRect();
			}
			api.start((i) => {
				if (index !== i) return;

				if (props.data[i].gender === 2) {
					if (cowFemale !== null && cowFemale !== props.data[i]) {
						return;
					}
					if (cowFemale === props.data[i]) {
						setCowFemale(null);
						scale = 1;
						x = (cowChoosePos?.x - femalePos?.x) * 1;
						y = (cowChoosePos?.y - femalePos?.y) * 1;
					} else {
						setCowFemale(props.data[i]);
						scale = 1.4;
						x = (cowChoosePos?.x - femalePos?.x) * -1;
						y = (cowChoosePos?.y - femalePos?.y) * -1;
					}
				} else if (props.data[i].gender === 1) {
					if (cowMale !== null && cowMale !== props.data[i]) {
						return;
					}
					if (cowMale === props.data[i]) {
						scale = 1;
						setCowMale(null);
						x = (cowChoosePos?.x - malePos?.x) * 1;
						y = (cowChoosePos?.y - malePos?.y) * 1;
					} else {
						scale = 1.4;

						setCowMale(props.data[i]);
						x = (cowChoosePos?.x - malePos?.x) * -1;
						y = (cowChoosePos?.y - malePos?.y) * -1;
					}
				}
				return {
					x,
					y,
					scale,
					delay: undefined,
				};
			});
		}
	});

	const ref = useRef(null);

	const handleClose = () => {
		setDownBreeding('cows-breeding-down');
		setTimeout(() => {
			props.isClose();
			setDownBreeding(null);
		}, 500);
	};

	return ReactDOM.createPortal(
		<React.Fragment>
			<div className='modal-wrapper' tabIndex={-1} role='dialog'>
				{modalShowing === true && (
					<CancelBreedingModal
						HandleCancel={() => setModalShowing(false)}
						cowMale={cowMale}
						cowFemale={cowFemale}
						handelCowMale={() => setCowMale(null)}
						handelCowFeMale={() => setCowFemale(null)}
						handleCowBreeding={() => setCowBreeding(false)}
					/>
				)}
				<div className={`cows-breeding ${downBreeding}`} ref={ref}>
					<div
						className='cows-breeding__header--tilte'
						style={{
							backgroundImage: 'url(./img/border-button.png)',
						}}>
						Breeding
					</div>
					<img
						src={closeButton}
						alt='Close'
						className='close-cows-modal image-button'
						onClick={() => handleClose()}
					/>
					<div className='cows-breeding__list'>
						<section className='cows-vertical-carousel-container'>
							<div
								className='cows-breeding__drop'
								style={{
									backgroundImage: 'url(/img/market-paper.png)',
								}}>
								<div className='cows-breeding__drop--type'>
									<div className='cows-breeding__drop--img' ref={finalRefs}>
										{!cowBreeding ? (
											<>
												{!cowFemale && (
													<img
														className='cows-breeding__drop--icon'
														src='./img/female.png'
														alt=''
														id='cow-female'
													/>
												)}
											</>
										) : (
											<>
												{!cowFemale ? (
													<img
														className='cows-breeding__drop--icon'
														src='./img/female.png'
														alt=''
														id='cow-female'
													/>
												) : (
													<img
														className='cows-breeding__drop--icon'
														src={serverIMG + cowFemale.img}
														style={{
															transform: `scale(1.9)`,
														}}
														alt=''
														id='cow-female'
													/>
												)}
											</>
										)}

										<img
											className='cows-breeding__drop--frames'
											src='./img/tall-card-border.png'
											alt=''
										/>
									</div>
									<div className='cows-breeding__drop--img' ref={finalRef}>
										{!cowBreeding ? (
											<>
												{!cowMale && (
													<img
														className='cows-breeding__drop--icon'
														src='./img/male.png'
														alt=''
														id='male'
													/>
												)}
											</>
										) : (
											<>
												{!cowMale ? (
													<img
														className='cows-breeding__drop--icon'
														src='./img/male.png'
														alt=''
														id='male'
													/>
												) : (
													<img
														className='cows-breeding__drop--icon'
														src={serverIMG + cowMale.img}
														alt=''
														style={{
															transform: `scale(1.9)`,
														}}
														id='cow-female'
													/>
												)}
											</>
										)}

										<img
											className='cows-breeding__drop--frames'
											src='./img/tall-card-border.png'
											alt=''
										/>
									</div>
								</div>
								<div className='breeding-progress'>
									<ProgressBar
										currentStack={breedings[0]?.times_claimed}
										maxStack={breedings[0]?.required_claims}
										next_availability={breedings[0]?.next_availability}
										handleFinish={setCountdown}
										height={1.8}
									/>
								</div>
								<div className='cows-breeding__drop-button'>
									<Button
										text={breedText}
										atr='semi-short'
										isDisabled={isBreedable}
										wrapperClassname='full-width'
										handleClick={handleBreed}
									/>
									<Button
										text='Cancel'
										atr='semi-short red'
										isDisabled={isCancelable}
										wrapperClassname='full-width'
										handleClick={handleCancel}
									/>
								</div>
							</div>
							{propsPos.map(({ x, y, scale }, i) => (
								<animated.div
									{...bind(i)}
									key={i}
									style={{
										transform: to(
											[x, y, scale],
											(x, y, scale) => `translate3d(${x}px,${y}px,0)`
										),
										position: 'relative',
										height: 'max-content',
									}}
									id={`cows-select-${i}`}>
									<animated.img
										style={{
											transform: to(
												[x, y, scale],
												(x, y, scale) =>
													`scale(${scale}) ${
														scale === 1.4
															? 'translate3d(13%,14%,0)'
															: 'translate3d(0,0,0)'
													}`
											),
										}}
										// src={serverIMG + props.data[i].img}
										src={serverIMG + cowData[i].img}
										alt={i}
										key={i}
										className='cows-select'
									/>
								</animated.div>
							))}
						</section>
					</div>
				</div>
				<div className='click-out-side' onClick={() => handleClose()} />
			</div>
		</React.Fragment>,
		document.body
	);
}

/* <animated.div
												style={{
													transform: to(
														[x, y, scale],
														(x, y, scale) =>
															`scale(${scale}) ${
																scale === 1.4
																	? "translate3d(13%,14%,0)"
																	: "translate3d(0,0,0)"
															}`
													),
													position: "absolute",
													width: "100%",
													height: "100%",
													zIndex: "1",
												}}> */

/* <div
													className='cow-note'
													onMouseEnter={() =>
														setIsHover(
															10 - cowData[i]?.id
														)
													}
													onMouseLeave={() =>
														setIsHover(1)
													}>
													<img
														className='cow-note__button image-button'
														src='/img/note-icon.png'
														alt='info'
													/>
													<div className='cow-note__content'>
														<div className='note-title'>
															<div className='note-title__name'>
																name
															</div>
															{/* <div className='note-tile__level'>Lv 3</div> */

/* </div>
														<div className='note-content'>
															<div className='note-content-info-label'>
																<span>
																	Charge Time
																</span>
																<div className='info-description'>
																	time
																</div>
															</div>
															<div className='note-content-info-label'>
																<span>
																	Energy
																	Consumed
																</span>
																<div className='info-description'>
																	consumed
																</div>
															</div>

															<div className='note-content-info-label'>
																<span>
																	Required
																	Build
																</span>
																<div className='info-description'>
																	claims
																</div>
															</div>
															<div className='note-content-info-label'>
																<span>
																	Animal Slots
																</span>
																<div className='info-description'></div>
															</div>
														</div>
													</div>
												</div>
											</animated.div> */
