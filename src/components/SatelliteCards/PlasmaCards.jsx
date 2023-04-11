/** @format */

import React, { useState } from 'react';
import Countdown from './Countdown';
import { chooseUsingCardById } from '../../redux/slice/ToolsSlicer';
import { useDispatch } from 'react-redux';
import { useSprings, animated, to } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { ChooseTab } from '../../redux/slice/navBarSlice';

const SERVERURL = 'https://ipfs.io/ipfs/';

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const too = (i) => ({
	x: (i < 3 ? i : 0) * -15,
	y: (i < 3 ? i : 0) * 20,
	scale: 1,
	rot: -10,
	delay: (i < 3 ? i : 0) * 100,
	zIndex: i < 3 ? i : 0,
	immediate: (key) => key === 'zIndex',
});
// Math.random() * 50
const from = (i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) =>
	`perspective(90rem) rotateX(0deg) rotateY(${
		-r * 1.5
	}deg) rotateZ(${0}deg) scale(${s})`;

export default function PlasmaCards(props) {
	const dispatch = useDispatch();
	const cards = props.cards;
	const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
	const [springProps, api] = useSprings(cards.length, (i) => ({
		...too(i),
		from: from(i),
	})); // Create a bunch of springs using the helpers above

	const bind = useDrag(
		({
			args: [index],
			down,
			movement: [mx],
			direction: [xDir],
			velocity,
			tap,
		}) => {
			if (tap) {
				if (cards.length > 1) {
					api.start((i) => too((cards.length - i + index) % cards.length));
				}
				dispatch(chooseUsingCardById(cards[index].asset_id));
				dispatch(ChooseTab(0));
			} else {
				const trigger = velocity > 0.2; // If you flick hard enough it should trigger the card to fly out
				const dir = xDir < 0 ? -1 : 1; // Direction should either point left or right
				if (!down && trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
				api.start((i) => {
					if (index !== i) return; // We're only interested in changing spring-data for the current spring
					const isGone = gone.has(index);
					const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
					const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
					const scale = down ? 1.2 : 1; // Active cards lift up a bit
					return {
						x,
						rot,
						scale,
						delay: undefined,
						config: {
							friction: 50,
							tension: down ? 800 : isGone ? 200 : 500,
						},
					};
				});
			}
			if (!down && gone.size === cards.length)
				setTimeout(() => gone.clear() || api.start((i) => too(i)), 600);
		},
		{ filterTaps: true }
	);
	// Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)

	return (
		<div className='plasma__cards-container'>
			<div className='slide-container'>
				{springProps.map(({ x, y, rot, scale, zIndex }, i) => (
					<animated.div
						key={i}
						style={{
							zIndex,
							transform: to(
								[x, y],
								(x, y) => `translate3d(${x / 10}rem,${y / 10}rem,0)`
							),
						}}>
						{/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
						<animated.div
							{...bind(i)}
							style={{
								transform: to([rot, scale], trans),
								backgroundImage: `url(${SERVERURL + cards[i].img})`,
							}}>
							<Countdown {...cards[i]} key={i} />
						</animated.div>
					</animated.div>
				))}
			</div>
		</div>
	);
}
