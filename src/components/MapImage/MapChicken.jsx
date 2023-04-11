/** @format */

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { chooseUsingCard } from '../../redux/slice/ToolsSlicer';
import { ChooseTab } from '../../redux/slice/navBarSlice';

const chickens = [
	'./img/chicken-1.png',
	'./img/chicken-2.png',
	'./img/chicken-3.png',
];

const chicks = ['./img/chick-1.png', './img/chick-2.png', './img/chick-3.png'];
const eggNest = ['./img/egg-nest.png'];

export default function MapChicken(props) {
	const chickenUsing = useSelector((state) => state.animals.chickenUsing);
	const [state, setstate] = useState();
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
				{chickenUsing.map((chicken, index) => {
					switch (chicken.template_id) {
						case 298614:
							return (
								<img
									className={`chicken ${
										index === state ? 'chicken-hover' : null
									} chicken-${((index + props.xRandom) % 3) + 1}`}
									src={chickens[(index + props.xRandom) % 3]}
									alt={index}
									key={index}
									onMouseEnter={() => handleMouseEnter(index)}
									onMouseLeave={() => handleMouseLeave()}
									onClick={() => handleChoose(index)}
								/>
							);
						case 298613:
							return (
								<img
									className={`chicken ${
										index === state ? 'chicken-hover' : null
									} chick-${((index + props.xRandom) % 3) + 1}`}
									src={chicks[(index + props.xRandom) % 3]}
									alt={index}
									key={index}
									onMouseEnter={() => handleMouseEnter(index)}
									onMouseLeave={() => handleMouseLeave()}
									onClick={() => handleChoose(index)}
								/>
							);
						case 298612:
							return (
								<img
									className={`egg-nest chicken ${
										index === state ? 'chicken-hover' : null
									}`}
									src={eggNest[0]}
									alt={index}
									key={index}
									onMouseEnter={() => handleMouseEnter(index)}
									onMouseLeave={() => handleMouseLeave()}
									onClick={() => handleChoose(index)}
								/>
							);
						default:
							break;
					}
					return null;
				})}
			</div>
		</>
	);
}
