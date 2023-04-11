/** @format */

import React from "react";

// import "./card.scss";
const serverIMG = "https://ipfs.io/ipfs/";

export default function Card(props) {
	return (
		<div className='card-section'>
			<div className='card-img' style={{ width: "70%" }}>
				<img
					src={serverIMG + props?.img}
					alt={props.template_name}
					className='card-img--item'
				/>
			</div>
		</div>
	);
}
