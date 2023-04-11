/** @format */

import React from 'react';
import ToolCard from './ToolCard';
import AnimalsCard from './AnimalsCard';
import MembershipCard from './MembershipCard';
import CropsCard from './CropsCard';

export default function HomeCard(props) {
	if (props.data?.schema_name && props?.data.type === 'Plasma')
		return (
			<ToolCard
				data={props.data}
				storeMining={props.storeMining[0] + 1}
				userEnergy={props.userEnergy}
				plasma={props.plasma}
			/>
		);
	if (props.data?.schema_name && props?.data.type === 'Oxygen')
		return (
			<ToolCard
				data={props.data}
				storeMining={props.storeMining[1] + 1}
				userEnergy={props.userEnergy}
				plasma={props.plasma}
			/>
		);
	if (props.data?.schema_name && props?.data.type === 'Asteroid')
		return (
			<ToolCard
				data={props.data}
				storeMining={props.storeMining[2] + 1}
				userEnergy={props.userEnergy}
				plasma={props.plasma}
			/>
		);
	if (props.data?.gender >= 0) return <AnimalsCard {...props} />;
	if (props.data?.miss_claim_limit) return <CropsCard {...props} />;
	if (props.data?.saved_claims) return <MembershipCard {...props} />;
	return null;
}
