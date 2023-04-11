/** @format */

import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isDesktop, withOrientationChange } from 'react-device-detect';
import Flash from '../../common/Flash/Flash';
import HeaderBar from '../../common/HeaderBar/HeaderBar';
import Navbar from '../../common/Navbar';
import Home from '../../tabs/home';
import Chest from '../../tabs/chest';
import Smithy from '../../tabs/smithy';
import Exchange from '../../tabs/exchange';
import Map from '../../tabs/map';
import Badge from '../../components/Badge/Badge';
import SetTokenModal from '../../components/Modal/SetTokenModal';
import StakeModal from '../../components/Modal/StakeModal';
import { thunkUpdater } from '../../redux/slice/GameSlicer';
import SatelliteCards from '../../components/SatelliteCards';
import {
	setUpdate,
	backgroundUpdate,
	setBackgroundUpdate,
} from '../../redux/slice/GameSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { setSplashScreen } from '../../redux/slice/authSlicer';
import { ChooseTab } from '../../redux/slice/navBarSlice';
import getErrorMessages from '../../utils/getErrorMessages';
import { getRefund, getRefundItem } from '../../redux/slice/AtomicSlicer';
import { imgList } from '../../assets/img/index';

import MapCow from '../../components/MapImage/MapCow';
import MapChicken from '../../components/MapImage/MapChicken';
import MapRice from '../../components/MapImage/MapRice';

import Market from '../../tabs/market';
import InformModal from '../../components/Modal/InformModal';
import Account2fa from '../../components/Account2fa';
import useWindowSize from '../../utils/useWindowSIze';
import ClaimMembership from '../../components/Modal/ClaimMembership';
import { useLayoutEffect } from 'react';

const serverIMG = 'https://ipfs.io/ipfs/';

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}
const xRandom = getRandomInt(4);

function Game(props) {
	const lackingResource = useSelector((state) => state.game.lackingResource);
	const isSplash = useSelector((state) => state.auth.splash);

	const selectedTab = useSelector((state) => state.navBar.selectedTab);
	const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
	const gameStatus = useSelector((state) => state.game.status);
	const update = useSelector((state) => state.game.update);
	const backgroundUpdateStatus = useSelector(
		(state) => state.game.backgroundUpdateStatus
	);
	const selectedMap = useSelector((state) => state.game.selectedMap);
	const usingTools = useSelector((state) => state.tools.usingItems);
	const usingBadges = useSelector((state) => state.badge.usingBadges);
	const usingItems = usingTools.concat(usingBadges);
	const refundAmount = useSelector((state) => state.atomic.refundAmount);

	const toolChest = useSelector((state) => state.atomic.tools);
	const badgeChest = useSelector((state) => state.atomic.memberships);
	const animalsChest = useSelector((state) => state.atomic.farmanimals);
	const buildingChest = useSelector((state) => state.atomic.farmbuilding);
	const plantsChest = useSelector((state) => state.atomic.plants);
	const oxygensChest = useSelector((state) => state.atomic.oxygens);
	const coinConfig = useSelector((state) => state.coin.coinConfig);
	const preloadChest = toolChest
		?.concat(animalsChest)
		?.concat(badgeChest)
		?.concat(buildingChest)
		?.concat(plantsChest)
		?.concat(coinConfig)
		?.concat(oxygensChest);
	const EquipConfigs = useSelector((state) => state.tools.EquipConfigs);
	const [isPreloadDone, setPreloadDone] = useState(0);
	const refundConf = useSelector((state) => state.atomic.refundConf);
	const isGameLoaded = useSelector((state) => state.game.isGameLoaded);
	const dispatch = useDispatch();
	const tranfer = useRef(selectedMap);

	useEffect(() => {
		async function transition() {
			await sleep(200);
			tranfer.current = selectedMap;
		}
		transition();
	}, [selectedMap]);

	const [viewWidth, viewHeight] = useWindowSize();

	const [height, setHeight] = useState(viewHeight);

	const [heightBg, setHeightBg] = useState(viewHeight);
	const [widthBg, setWidthBg] = useState(viewWidth);

	useLayoutEffect(() => {
		if ((viewHeight * 144) / 90 > viewWidth) {
			setHeight(((viewWidth - 100) * 90) / 144);
		} else setHeight(viewHeight);

		if ((viewHeight * 619) / 350 > viewWidth) {
			setHeightBg((viewWidth * 350) / 619);
			setWidthBg(viewWidth);
		} else {
			setHeightBg(viewHeight);
			setWidthBg((viewHeight * 619) / 350);
		}
	}, [viewWidth, viewHeight]);

	useEffect(() => {
		const loadScreenData = async () => {
			try {
				if (isLoggedIn && gameStatus === 'idle') {
					await dispatch(thunkUpdater()).unwrap();
				}
			} catch (error) {
				getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			} finally {
				dispatch(setUpdate(false));
				dispatch(setBackgroundUpdate(false));
			}
		};
		loadScreenData();
	}, [isLoggedIn, gameStatus, dispatch]);

	useEffect(() => {
		let sources = [];
		const preloadImage = () => {
			EquipConfigs.forEach((config) => {
				if (sources[serverIMG + config.img] !== undefined) {
					return null;
				} else {
					const newImage = new Image();

					newImage.src = serverIMG + config.img;

					window[newImage.src] = newImage;
					sources.push(newImage.src);
				}
			});

			preloadChest.forEach((card) => {
				if (sources[serverIMG + card.data?.img] !== undefined) {
					return null;
				} else {
					const newImage = new Image();
					newImage.src = serverIMG + card.data.img;
					window[newImage.src] = newImage;
					sources.push(newImage.src);
				}
			});
			let count = 0;
			sources.forEach((source) => {
				window[source].onload = () => {
					count = count + 1;
					if (count === sources.length - 5) {
						setPreloadDone(isPreloadDone + 1);
					}
				};
			});
		};
		if (isGameLoaded === 'loaded' && isSplash === true) preloadImage();
	}, [
		EquipConfigs,
		preloadChest,
		isGameLoaded,
		isPreloadDone,
		isSplash,
		dispatch,
	]);

	//Load static img

	useEffect(() => {
		let sources = [];
		const preloadImage = () => {
			imgList.forEach((config) => {
				if (sources[config] !== undefined) {
					return null;
				} else {
					const newImage = new Image();
					newImage.src = config;
					window[newImage.src] = newImage;
					sources.push(newImage.src);
				}
			});
			let count = 0;
			if (sources.length > 0) { // updated by  original: no if clause
				sources.forEach((source) => {
					window[source].onload = () => {
						count++;
						if (count === sources.length) {
							setPreloadDone(isPreloadDone + 1);
						}
					};
				});
			} else {
				setPreloadDone(isPreloadDone + 1);
			}
		};
		preloadImage();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		const handleUpdate = () => {
			if (update || backgroundUpdateStatus) {
				sleep(1500).then(() => {
					backgroundUpdateStatus === true
						? dispatch(backgroundUpdate())
						: dispatch(thunkUpdater());
					dispatch(setBackgroundUpdate(false));
					dispatch(setUpdate(false));
				});
			}
		};

		handleUpdate();
	}, [update, backgroundUpdateStatus, dispatch]);

	useEffect(() => {
		if (isPreloadDone === 1) { // updated by      original: isPreloadDone === 2
			dispatch(setSplashScreen(false));
		}
	}, [isPreloadDone, dispatch]);

	useEffect(() => {
		if (
			usingItems.length === 0 &&
			toolChest?.length > 0 &&
			isGameLoaded === 'loaded'
		)
			dispatch(ChooseTab(1));
		else {
			dispatch(ChooseTab(0));
		}

		return () => {}; // eslint-disable-next-line
	}, [isGameLoaded]);

	useEffect(() => {
		const handleRefund = async () => {
			try {
				const resultAction = await dispatch(getRefund()).unwrap();

				if (resultAction?.transaction_id) {
					dispatch(
						setErrorMessage(
							`You have been refunded ${refundAmount} successfully. Thank you for your cooperation!`
						)
					);
					dispatch(toggleModal(true));
					await dispatch(getRefundItem()).unwrap();
				}
			} catch (error) {
				getErrorMessages(error, dispatch, setErrorMessage);
				dispatch(toggleModal(true));
			} finally {
				dispatch(setUpdate(true));
			}
		};

		if (
			isGameLoaded === 'loaded' &&
			isSplash === false &&
			refundConf.length > 0
		)
			handleRefund();
	}, [isGameLoaded, isSplash, refundConf, dispatch, refundAmount]);

	const renderMap = () => {
		switch (selectedMap) {
			case 1:
				return <MapChicken xRandom={xRandom} />;
			case 2:
				return <MapRice />;
			case 3:
				return <MapCow xRandom={xRandom} />;
			default:
				break;
		}
	};
	const renderTab = (selectedTab) => {
		switch (selectedTab) {
			case 0:
				return (
					<div className='wapper'>
						<Home />
					</div>
				);

			case 1:
				return (
					<div className='wapper wapper-chest'>
						<Chest />;
					</div>
				);

			case 2:
				return (
					<div className='wapper'>
						<Smithy />
					</div>
				);

			case 3:
				return (
					<div className='wapper'>
						<Exchange />
					</div>
				);

			case 4:
				return <Map />;

			case 5:
				return <Market />;

			case 7:
				return <div className='wapper wapper-none'></div>;
			default:
				break;
		}
	};

	const { isLandscape } = props;

	return (
		!isSplash && (
			<div
				className='game-container '
				style={{
					backgroundImage: `url(${props.background})`,
					height: `${heightBg}px`,
					width: `${widthBg}px`,
				}}>
				{' '}
				{tranfer.current !== selectedMap ? (
					<div className='fade-container'></div>
				) : null}
				{/* <img src={chicken} alt="" /> */}
				{!isDesktop ? null : <SatelliteCards />}
				{!isDesktop ? (
					isLandscape ? (
						<>
							<div className='game-content' style={{ height: `${height}px` }}>
								<HeaderBar />

								{renderTab(selectedTab)}

								<Navbar />
								<Badge />
								{renderMap()}
							</div>
						</>
					) : (
						<h1>Rotate your Phone to have the best experience.</h1>
					)
				) : (
					<>
						<div className='game-content' style={{ height: `${height}px` }}>
							<HeaderBar />

							{renderTab(selectedTab)}

							<Navbar />
							<Badge />
							{renderMap()}
						</div>
					</>
				)}
				{lackingResource !== '' && (
					<StakeModal lackingResource={lackingResource} />
				)}
				<Account2fa />
				<InformModal />
				<SetTokenModal />
				<ClaimMembership />
				<Flash />
			</div>
		)
	);
}

const HigherGame = withOrientationChange(Game);
export default HigherGame;
