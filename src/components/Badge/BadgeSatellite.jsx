/** @format */

import React from 'react';

const SERVERURL = 'https://ipfs.io/ipfs/';

export default function BadgeSatellite(props) {
	// const [isShowed, setShowed] = useState(false);
	// onMouseEnter={() => setShowed(true)}
	// onMouseLeave={() => setShowed(false)}
	return (
		<div className='badge'>
			{/* {!isShowed ? <img src={SERVERURL + props.badge_img} alt={props.name} className="badge-img" />
                : <p className="badge-time">{timeStr}</p>
            } */}
			<img
				src={SERVERURL + props.badge_img}
				alt={props.name}
				className='badge-img'
			/>
		</div>
	);
}
