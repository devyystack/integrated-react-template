/** @format */

// import "./index.scss"
import React, { useEffect } from "react";
import lottie from "lottie-web";
import ReactDOM from "react-dom";

import { useSelector, useDispatch } from "react-redux";
// import * as animationData from "./loading.json";
import { cancelLoading } from "../../redux/slice/GameSlicer";
const LoadingModal = () => {
	const isLoading = useSelector((state) => state.game.status);
	const cardActionStatus = useSelector((state) => state.tools.status);
	const usingItem = useSelector((state) => state.tools.usingItemsStatus);
	const itemsLoading = useSelector((state) => state.tools.itemListStatus);
	const userStatus = useSelector((state) => state.user.status);
	const isLoadingModal = useSelector((state) => state.modal.isLoading);
	const isExchanging = useSelector((state) => state.exchange.status);
	const backgroundStatus = useSelector(
		(state) => state.game.backgroundStatus
	);
	const badgeStatus = useSelector((state) => state.badge.status);
	const isCanceled = useSelector((state) => state.game.isCanceled);
	const isAuthenticating = useSelector((state) => state.auth.status);
	const isFeeding = useSelector((state) => state.animals.status);
	const isWatering = useSelector((state) => state.plants.status);
	const isBuying = useSelector((state) => state.market.status);
	const isExchangingRewards = useSelector((state) => state.oxygens.status);
	const isBuilding = useSelector((state) => state.builds.status);
	const isBreeding = useSelector((state) => state.breeding.status);
	const isAtomic = useSelector((state) => state.atomic.status);
	const isClosable = isAuthenticating === "loading";
	// console.log(`isAuthenticating=${isAuthenticating}, isAtomic=${isAtomic}, isExchanging=${isExchanging}, isWatering=${isWatering}, isBuying=${isBuying}, isBuilding=${isBuilding}, isBreeding=${isBreeding}, isExchangingRewards=${isExchangingRewards}, badgeStatus=${badgeStatus}, isFeeding=${isFeeding}, isFeeding=${isFeeding}, isLoading=${isLoading}, userStatus=${userStatus}, cardActionStatus=${cardActionStatus}, usingItem=${usingItem}, itemsLoading=${itemsLoading}, isLoadingModal=${isLoadingModal}, backgroundStatus=${backgroundStatus}, isCancelled=${isCanceled}`)
	const modalLoading =
		(isAuthenticating === "loading" ||
			isAtomic === "loading" ||
			isExchanging === "loading" ||
			isWatering === "loading" ||
			isBuying === "loading" ||
			isBuilding === "loading" ||
			isBreeding === "loading" ||
			isExchangingRewards === "loading" ||
			badgeStatus === "loading" ||
			isFeeding === "loading" ||
			isLoading === "loading" ||
			userStatus === "loading" ||
			cardActionStatus === "loading" ||
			usingItem === "loading" ||
			itemsLoading === "loading" ||
			isLoadingModal) &&
		backgroundStatus === "loading"  // updated by    original: !==
		&& !isCanceled;
	const dispatch = useDispatch();

	useEffect(() => {
		lottie.loadAnimation({
			container: document.querySelector("#loadingModal"),
			// animationData: animationData.default,
			renderer: "svg", // "canvas", "html"
			loop: true, // boolean
			autoplay: true, // boolean
		});
	}, [modalLoading]);
	return modalLoading
		? ReactDOM.createPortal(
				<React.Fragment>
					<div
						className='modal-wrapper'
						aria-modal
						aria-hidden
						tabIndex={-1}
						role='dialog'>
						<div className='modal loading-modal'>
							{!isClosable && (
								<div className='modal-header'>
									<img
										src='./img/close-button.png'
										alt='Close'
										className='image-button close-modal'
										onClick={() =>
											dispatch(cancelLoading(true))
										}
									/>
								</div>
							)}
							<div
								className='modal-body'
								id='loadingModal'
								style={{ width: "300", height: "300" }}></div>
							<div className='loading-modal--overlay'></div>
						</div>
					</div>
				</React.Fragment>,
				document.body
		  )
		: null;
};
export default LoadingModal;
