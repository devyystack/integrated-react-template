/** @format */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { chooseUsingCard } from '../../redux/slice/ToolsSlicer';
import { ChooseTab } from '../../redux/slice/navBarSlice';
import CowBreeding from '../Breeding/CowBreeding';
import Button from '../../components/Button/Button';

const babyCaft = ['./img/babyCaft-1.png', './img/babyCaft-2.png'];
const caft = ['./img/caft-1.png', './img/caft-2.png'];
const cows = ['./img/cow-1.png', './img/cow-2.png'];

export default function MapCow(props) {
	const cowUsing = useSelector((state) => state.animals.cowUsing);
	const breedings = useSelector((state) => state.breeding.breedings);

	const [state, setstate] = useState();
	const [isShowing, setIsShowing] = useState(false);

	const oldCows = cowUsing.filter(
		(cow) => cow.name.includes('Bull') || cow.name.includes('Dairy')
	);

	const oldCow = oldCows.filter((oldCowItem) => {
		return (
			breedings[0]?.bearer_id !== oldCowItem.asset_id &&
			breedings[0]?.partner_id !== oldCowItem.asset_id
		);
	});

	const cowBreeding = cowUsing.filter(
		(cow) =>
			cow.asset_id.includes(breedings[0]?.bearer_id) ||
			cow.asset_id.includes(breedings[0]?.partner_id)
	);

	const dispatch = useDispatch();

	const handleMouseEnter = (i) => {
		setstate(i);
	};

	const handleMouseLeave = () => {
		setstate(-1);
	};

	const handleChoose = (index) => {
		dispatch(ChooseTab(0));
		dispatch(chooseUsingCard(index));
	};

	return (
		<>
			<div className='game-container__image'>
				<div className='button-cow-breeding'>
					<Button
						text='Breeding'
						handleClick={() => setIsShowing(true)}
						atr='semi-long cow'
					/>
				</div>
				{cowUsing.map((cow, index) => {
					if (cow.name.includes('Baby'))
						return (
							<img
								className={`${index === state ? 'cow cow-hover' : null} cows-${
									((index + props.xRandom) % 6) + 1
								}`}
								src={babyCaft[(index + props.xRandom) % 3]}
								alt={index}
								key={index}
								onMouseEnter={() => handleMouseEnter(index)}
								onMouseLeave={() => handleMouseLeave()}
								onClick={() => handleChoose(index)}
							/>
						);
					if (cow.name.includes('Calf'))
						return (
							<img
								className={`${index === state ? 'cow cow-hover' : null} cows-${
									((index + props.xRandom) % 6) + 1
								}`}
								src={caft[(index + props.xRandom) % 2]}
								alt={index}
								key={index}
								onMouseEnter={() => handleMouseEnter(index)}
								onMouseLeave={() => handleMouseLeave()}
								onClick={() => handleChoose(index)}
							/>
						);
					if (cow.name.includes('Bull') || cow.name.includes('Dairy'))
						return (
							<img
								className={`${index === state ? 'cow cow-hover' : null} cows-${
									((index + props.xRandom) % 6) + 1
								}`}
								src={cows[(index + props.xRandom) % 2]}
								alt={index}
								key={index}
								onMouseEnter={() => handleMouseEnter(index)}
								onMouseLeave={() => handleMouseLeave()}
								onClick={() => handleChoose(index)}
							/>
						);
					return null;
				})}
			</div>
			{isShowing && (
				<CowBreeding
					isClose={() => setIsShowing(false)}
					data={oldCow}
					breedings={breedings}
					cowBreeding={cowBreeding}
				/>
			)}
		</>
	);
}
