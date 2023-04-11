/** @format */

import React from "react";
// import { isDesktop } from 'react-device-detect';
const serverIMG = "https://ipfs.io/ipfs/";

export default function CardList(props) {
	// const myRef = useRef(null)

	// useEffect(() => {
	//     if (isDesktop)
	//         myRef.current.scrollIntoView()
	// }, [props.selected])

	return (
		<section className='vertical-carousel-container'>
			{props.data?.map(
				(item, i) =>
					// ref={i === props.selected ? myRef : null}

					item?.img && (
						<img
							src={serverIMG + item?.img}
							alt={i}
							className={
								i === props.selected
									? "carousel__img--item active"
									: "carousel__img--item"
							}
							key={i}
							onClick={() => props.HandleChoose(i)}
						/>
					)
			)}
		</section>
	);
}
