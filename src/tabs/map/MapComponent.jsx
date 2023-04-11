/** @format */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChooseTab } from '../../redux/slice/navBarSlice';
import { claimBuilding } from '../../redux/slice/BuildingSlicer';
import Button from '../../components/Button/Button';
import getErrorMessages from '../../utils/getErrorMessages';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import RemoveBuildsModal from '../../components/Modal/RemoveBuildsModal';
import { useItem } from '../../redux/slice/ToolsSlicer';
import { toggleModal, setErrorMessage } from '../../redux/slice/modalSlice';
import { UpdateHealth } from '../../redux/slice/userSlicer';
import {
	setSelectedMap,
	cancelLoading,
	setUpdate,
} from '../../redux/slice/GameSlicer';
import { chooseUsingCard } from '../../redux/slice/ToolsSlicer';
import { getFirstBuilding } from '../../redux/slice/AtomicSlicer';

export default function MapComponent(props) {
	const dispatch = useDispatch();
	const isReady = props.build?.is_ready || 'disabled';

	const [isBuilding, setBuilding] = useState('disabled');
	const firstBuilding = useSelector((state) =>
		getFirstBuilding(state.atomic, props.build?.template_id + '')
	);
	const isInnerItem = props.usingItems === 0 || 'disabled';
	const [modalShowing, setModalShowing] = useState(false);

	const HandleClick = (index) => {
		if (isReady !== 'disabled' || index === 0) {
			dispatch(setSelectedMap(index));
			dispatch(ChooseTab(0));
			dispatch(chooseUsingCard(0));
		}
	};

	const buildText =
		isBuilding !== 'disabled'
			? 'Build'
			: props.build?.asset_id
			? 'Countdown'
			: 'Build';
	const isBuildable = buildText === 'Build' || 'disabled';
	useEffect(() => {
		setBuilding(
			props.build?.next_availability * 1000 < Date.now() || 'disabled'
		);
		return () => {
			setBuilding(true);
		};
	}, [props.build.next_availability]);

	const HandleRemove = () => {
		if (isBuilding === true) setModalShowing(true);
	};

	const HandleBuildWear = async () => {
		if (isBuildable !== 'disabled') {
			if (props.build?.is_ready < 1) {
				await HandleBuild();
			} else {
				if (firstBuilding) {
					await HandleWear();
				}
			}
		}
	};

	const HandleBuild = async (asset_id) => {
		try {
			const response = await dispatch(
				claimBuilding(asset_id || props.build.asset_id)
			).unwrap();
			if (!!response.transaction_id || !!response.processed) {
				dispatch(UpdateHealth(props.build.energy_consumed));
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
		} finally {
			dispatch(setUpdate(true));
		}
	};
	const HandleWear = async () => {
		try {
			dispatch(cancelLoading(false));
			const resultAction = await dispatch(
				useItem({
					asset_id: firstBuilding.asset_id,
					template_id: firstBuilding.template_id,
				})
			).unwrap();

			if (resultAction?.transaction_id !== null) {
				await HandleBuild(firstBuilding.asset_id);
			}
		} catch (error) {
			getErrorMessages(error, dispatch, setErrorMessage, toggleModal);
			throw error;
		} finally {
			dispatch(setUpdate(true));
		}
	};

	return (
		<div className='map-container'>
			{modalShowing === true && (
				<RemoveBuildsModal
					HandleCancel={() => setModalShowing(false)}
					type='build'
					asset_id={props.build.asset_id}
					name={props.build.name}
				/>
			)}
			<span
				className='map-container-bg'
				onClick={(e) => HandleClick(props.index)}
				style={{
					backgroundImage: `url(${props.bgImage})`,
					filter: `grayscale(${
						isReady !== 'disabled' || props.index === 0 ? 0 : 1
					})`,
				}}></span>
			<div className='map-component-container'>
				<div className='map-component__content'>
					<div className='map-title'>
						<span>{props.title || 'Title'}</span>{' '}
						{props.index !== 0 && (
							<span className='map-title__count'>
								{props.usingItems || 0}/{props.build?.num_slots}
							</span>
						)}
					</div>
					{props.index !== 0 && (
						<div className='map-note'>
							<img
								className='map-note__button image-button'
								src='/img/note-icon.png'
								alt='info'
							/>
						</div>
					)}

					<div className='map-note__content'>
						<div className='note-title'>
							<div className='note-title__name'>{props.build?.name}</div>
							{/* <div className='note-tile__level'>Lv 3</div> */}
						</div>
						<div className='note-content'>
							<div className='note-content-info-label'>
								<span>Charge Time</span>
								<div className='info-description'>
									{props.build?.charged_time / 60} mins
								</div>
							</div>
							<div className='note-content-info-label'>
								<span>Energy Consumed</span>
								<div className='info-description'>
									{props.build?.energy_consumed}
								</div>
							</div>

							<div className='note-content-info-label'>
								<span>Required Build</span>
								<div className='info-description'>
									{props.build?.required_claims}
								</div>
							</div>
							<div className='note-content-info-label'>
								<span>Number of Slots</span>
								<div className='info-description'>{props.build?.num_slots}</div>
							</div>
						</div>
					</div>

					{props.build?.is_ready === 1 && (
						<div className='map-button tooltip'>
							<Button
								text='Remove'
								isDisabled={isInnerItem}
								handleClick={HandleRemove}
								atr='short small'
								wrapperClassname='full-width'
							/>
							{isInnerItem === 'disabled' && (
								<span className='tooltiptext tooltip-bottom left'>
									<i className='arrow-up left'></i>This building is currently in
									use
								</span>
							)}
						</div>
					)}

					{props.build?.times_claimed && !(props.build?.is_ready === 1) && (
						<div className='map-component-progress'>
							<ProgressBar
								currentStack={props.build?.times_claimed}
								next_availability={props.build.next_availability}
								maxStack={props.build.required_claims}
								handleFinish={setBuilding}
								height={1.5}
							/>
						</div>
					)}
					{(firstBuilding?.asset_id || props.build?.asset_id) &&
						!props.build?.is_ready && (
							<div className='build-btn__wrapper'>
								<Button
									text={buildText}
									isDisabled={isBuildable}
									handleClick={HandleBuildWear}
									atr='short small'
									wrapperClassname='full-width'
								/>
								{props.build.asset_id && (
									<Button
										text='Remove'
										isDisabled={isBuilding}
										handleClick={HandleRemove}
										atr='short small'
										wrapperClassname='full-width'
									/>
								)}
							</div>
						)}
				</div>
			</div>
		</div>
	);
}
