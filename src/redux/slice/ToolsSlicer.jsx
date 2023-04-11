/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { game } from './authSlicer';
import { lockFeature, MAIN_SERVERURL, ticketTemplate } from '../../config';
import { isRepeatable, sleep, timeout } from '../../utils';
import { getChestAssetsByTemplate } from './AtomicSlicer';

const ticketTemplateMapping = {
	5: ticketTemplate.main[0],
	10: ticketTemplate.main[1],
	15: ticketTemplate.main[2],
};

export const getCraftTransaction = createAsyncThunk(
	'tools/getCraftTransaction',
	async (transaction_id) => {
		let response = {};
		let result = {};
		let flag = false;
		let SERVER_URL = [...MAIN_SERVERURL];

		for (let count = 0; count < MAIN_SERVERURL.length * 8; count++) {
			await sleep(1000);
			try {
				response = await timeout(
					game.getTransaction(
						transaction_id,
						SERVER_URL[count % SERVER_URL.length]
					),
					2000,
					null
				);
				if (response.executed !== true) continue;
				if (response.actions) {
					let claim = '';
					for (let index = 0; index < response.actions.length; index++) {
						if (response.actions[index].act.name === 'logmintasset') {
							claim = response.actions[index].act?.data.data;
							result = { claim: claim };
							if (claim.discount) flag = true;
						}
					}
				}
				if (flag !== false) return result;
			} catch (error) {
				SERVER_URL.splice(count % SERVER_URL.length, 1);
				count--;
				if (SERVER_URL.length === 0) throw new Error(`Craft successfully!`);
				continue;
			}
		}
		throw new Error(`Craft successfully!`);
	}
);

export const getUsingItems = createAsyncThunk(
	'tools/getUsingItems',
	async () => {
		const usingItems = await game.getUsingItems();
		return usingItems;
	}
);

export const useItem = createAsyncThunk(
	'tools/useItem',
	async ({ asset_id, Type, template_id }) => {
		for (let count = 0; count < 3; count++) {
			try {
				const respond = await game.stake(asset_id, Type, template_id);
				return respond;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;
				
				throw error;
			}
			
			// try {
			// 	const respond = await game.addGadget(asset_id, Type, template_id);
			// 	return respond;
			// } catch (error) {
			// 	if (isRepeatable(error.message) && count < 2) continue;
				
			// 	throw error;
			// }
		}
	},
	{
		condition: ({ asset_id }, { getState }) => {
			const { tools } = getState();
			if (tools.usingItems.length >= 8) {
				return false
			}
			// if (props.template_id == "203881") {
			//     dispatch(setErrorMessage("This tool is not wearable until 12am UTC August 31st!"))
			//     dispatch(toggleModal(true))
			//     return null
			// }
			// const checkList = ['260628', '260629', '260631', '260635',
			//     '260636', '260638', '260639', '260641',
			//     '260642', '260644', '260647', '260648',
			//     '260621']

			// for (let index in checkList) {
			//     if (checkList[index] === data.template_id)
			//         return false
			// }

			const fetchStatus = tools.requests.filter(
				(__item_id) => __item_id === asset_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);
export const removeItem = createAsyncThunk(
	'tools/removeItem',
	async (asset_id, { getState, rejectWithValue }) => {
		// should be updated

		// const { auth } = getState();
		// const isVerify = auth.authSettings.features & lockFeature[1].value;
		// const isUnlocked2FA = auth.isUnlocked2FA;
		// if (isVerify) {
		// 	if (!isUnlocked2FA)
		// 		return rejectWithValue('You have to Unlock 2FA to use this Feature!');
		// }
		// for (let count = 0; count < 3; count++) {
		// 	try {
		// 		const response = await game.authRequiredTransaction(
		// 			game.verify2fa(isVerify),
		// 			game.unstake(item_id)
		// 		);
		// 		return response;
		// 	} catch (error) {
		// 		if (isRepeatable(error.message) && count < 2) continue;
		// 		throw error;
		// 	}
		// }

		// end

		// added by
		
		for (let count = 0; count < 3; count++) {
			try {
				// const response = await game.authRequiredTransaction(
				// 	game.verify2fa(true),
				// 	game.unstakesimple(asset_id),
				// 	game.detachGadget(asset_id)
				// );
				// const response44 = await game.unstakesimple(asset_id);
				const response44 = await game.detachGadget(asset_id);
				return response44;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;
				throw error;
			}
		}

		// end
	},
	{
		condition: (item_id, { getState }) => {
			const { tools } = getState();

			const fetchStatus = tools.requests.filter(
				(__item_id) => __item_id === item_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);
export const repairItem = createAsyncThunk(
	'tools/repairItem',
	async (data) => {
		for (let count = 0; count < 3; count++) {
			try {
				const respond = await game.repair(data.id);
				return respond;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;

				throw error;
			}
		}
	},
	{
		condition: (data, { getState, extra }) => {
			const { tools } = getState();
			const fetchStatus = tools.requests.filter(
				(__item_id) => __item_id === data.id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);
export const mineItem = createAsyncThunk(
	'tools/mineItem',
	async ({item_id, img}) => {
		for (let count = 0; count < 3; count++) {
			try {
				let respond = await game.mine(item_id, img);
				return respond;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;

				throw error;
			}
		}
	},
	{
		condition: (item_id, { getState, extra }) => {
			const { tools } = getState();
			const fetchStatus = tools.requests.filter(
				(__item_id) => __item_id === item_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const getTransaction = createAsyncThunk(
	'tools/getTransaction',
	async (transaction_id) => {
		let response = {};
		let flag = false;
		let SERVER_URL = [...MAIN_SERVERURL];

		for (let count = 0; count < MAIN_SERVERURL.length * 5; count++) {
			await sleep(500);
			try {
				response = await timeout(
					game.getTransaction(
						transaction_id,
						SERVER_URL[count % SERVER_URL.length]
					),
					2000,
					null
				);
				if (response.executed !== true) continue;
				if (response.actions) {
					let bonus = '';
					let claim = '';
					response.actions.forEach((action) => {
						if (action.act.name === 'logbonus') bonus = action;
						if (action.act.name === 'logclaim') claim = action;
					});
					response = { bonus: bonus, claim: claim };
					if (
						bonus.act?.data?.bonus_rewards?.length !==
						claim.act?.data?.rewards?.length
					)
						continue;
					if (
						(bonus.act?.name === 'logbonus' &&
							bonus.act?.data?.bonus_rewards?.length > 0) ||
						(claim.act?.name === 'logclaim' &&
							claim.act?.data?.rewards?.length > 0)
					)
						flag = true;
					else continue;
				}
				if (flag !== false) return response;
			} catch (error) {
				SERVER_URL.splice(count % SERVER_URL.length, 1);
				count--;
				if (SERVER_URL.length === 0)
					throw new Error(`Mined successfully. Your labors got you rewards`);

				continue;
			}
		}
		throw new Error(`Mined successfully. Your labors got you rewards`);
	}
);
export const getEquipConfigs = createAsyncThunk(
	'tools/getEquipConfigs',
	async () => {
		const EquipConfigs = await game.getEquipConfigs();
		return EquipConfigs;
	}
);

export const craftTool = createAsyncThunk(
	'craft/craftTool',
	async (data, { getState, rejectWithValue }) => {
		for (let count = 0; count < 3; count++) {
			try {
				let response = await game.craftMe(data.craft);
				return response;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;

				throw error;
			}
		}

		// const { auth } = getState();       // updated by

		// let isVerify = auth.authSettings.features & lockFeature[2].value;
		// const isUnlocked2FA = auth.isUnlocked2FA;
		// if (isVerify) {
		// 	if (!isUnlocked2FA)
		// 		return rejectWithValue('You have to Unlock 2FA to use this Feature!');
		// }
		// const { ticket } = data;
		// let ticket_ids = [];
		// if (ticket !== 0) {
		// 	const { atomic } = getState();
		// 	[...ticket_ids] = getChestAssetsByTemplate(
		// 		atomic.tickets,
		// 		ticketTemplateMapping[ticket]
		// 	);
		// }
		// for (let count = 0; count < 3; count++) {
		// 	try {
		// 		const response = await game.authRequiredTransaction(
		// 			game.verify2fa(isVerify),
		// 			game.craft(data.craft, ticket_ids.pop() || 0)
		// 		);
		// 		return response;
		// 	} catch (error) {
		// 		if (isRepeatable(error.message) && count < 2) continue;

		// 		throw error;
		// 	}
		// }
	},
	{
		condition: (data, { getState, extra }) => {
			const { tools } = getState();
			const item_id = data.craft.template_id;
			const fetchStatus = tools.requests.filter(
				(__item_id) => __item_id === item_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const selectUsingCardByAssetId = (state, asset_id) =>
	state.usingItems.filter((item) => item.asset_id === asset_id);

const mapMintResources = {
	PLASMA: 'plasma_mint',
	OXYGEN: 'oxygen_mint',
	ASTEROI: 'asteroid_mint', // updated by    original: ASTEROID
};

export const toolsSlice = createSlice({
	name: 'tools',
	initialState: {
		toolChest: [],
		usingItems: [],
		EquipConfigs: [],
		EquipConfigsStatus: 'idle',
		usingItemsStatus: 'idle',
		itemListStatus: 'idle',
		status: 'idle',
		miningStatus: 'idle',
		response: '',
		selectedCard: 0,
		selectedUsingCard: 0,
		requests: [],
	},
	reducers: {
		getCard: (state, action) => {
			return state.card[action.payload];
		},
		chooseCard: (state, action) => {
			state.selectedCard = action.payload;
		},
		chooseUsingCard: (state, action) => {
			state.selectedUsingCard = action.payload;
		},
		repairCard: (state, action) => {
			let index = state.usingItems.findIndex(
				(item) => item.asset_id === action.payload
			);
			state.usingItems[index].current_durability =
				state.usingItems[index].durability;
		},
		UpdateDurability: (state, action) => {
			state.usingItems[action.payload.index].current_durability =
				parseInt(state.usingItems[action.payload.index].current_durability) -
				parseInt(action.payload.value);
		},
		UpdateTimestamp: (state, action) => {
			state.usingItems[state.selectedUsingCard].next_availability =
				Date.now() / 1000 +
				parseInt(state.usingItems[state.selectedUsingCard].charged_time);
		},
		chooseUsingCardById: (state, action) => {
			state.selectedUsingCard = state.usingItems.findIndex(
				(usingCard) => usingCard.asset_id === action.payload
			);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getEquipConfigs.pending, (state, action) => {
				state.EquipConfigsStatus = 'loading';
			})
			.addCase(getEquipConfigs.fulfilled, (state, action) => {
				state.EquipConfigsStatus = 'loaded';
				state.EquipConfigs = action.payload;

				for (let item in state.EquipConfigs) {
					const parsed = state.EquipConfigs[item].rewards[0].split(' ');
					state.EquipConfigs[item].reward = parseFloat(parsed[0]);
					for (let mintIndex in state.EquipConfigs[item].mints) {
						const parsed = state.EquipConfigs[item].mints[mintIndex].split(' ');
						state.EquipConfigs[item][mapMintResources[parsed[1]]] = parseInt(
							parsed[0]
						);
					}
				}
			})
			.addCase(getEquipConfigs.rejected, (state, action) => {
				state.EquipConfigsStatus = 'failed';
				state.error = action.error.message;
			})
			.addCase(getUsingItems.pending, (state, action) => {
				state.usingItemsStatus = 'loading';
			})
			.addCase(getUsingItems.fulfilled, (state, action) => {
				state.usingItemsStatus = 'loaded';
				// state.usingItems = action.payload
				let tempUsingItems = [];
				let tempID = [];
				for (let item in action.payload) {
					const temp = state.EquipConfigs.find(
						(equip) => equip.template_id === action.payload[item].template_id
					);
					tempUsingItems.push(Object.assign(action.payload[item], temp));
					tempID.push(action.payload[item].asset_id);
				}
				state.usingItems = tempUsingItems;
			})
			.addCase(getUsingItems.rejected, (state, action) => {
				state.usingItemsStatus = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})

			.addCase(useItem.pending, (state, action) => {
				state.status = 'loading';
				state.requests.push(action.meta.arg);
			})
			.addCase(useItem.fulfilled, (state, action) => {
				state.status = 'loaded';
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(useItem.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})

			.addCase(removeItem.pending, (state, action) => {
				state.status = 'loading';

				state.requests.push(action.meta.arg);
			})
			.addCase(removeItem.fulfilled, (state, action) => {
				state.status = 'loaded';

				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(removeItem.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(repairItem.pending, (state, action) => {
				state.status = 'loading';

				state.requests.push(action.meta.arg.id);
			})
			.addCase(repairItem.fulfilled, (state, action) => {
				state.status = 'loaded';
				const index = state.requests.indexOf(action.meta.arg.id);
				state.requests.splice(index, 1);
			})
			.addCase(repairItem.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				const index = state.requests.indexOf(action.meta.arg.id);
				state.requests.splice(index, 1);
			})
			.addCase(mineItem.pending, (state, action) => {
				state.status = 'loading';
				state.requests.push(action.meta.arg);
			})
			.addCase(mineItem.fulfilled, (state, action) => {
				state.status = 'loaded';
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(mineItem.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;

				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(craftTool.pending, (state, action) => {
				state.status = 'loading';
				state.requests.push(action.meta.arg.template_id);
			})
			.addCase(craftTool.fulfilled, (state, action) => {
				state.status = 'loaded';

				state.response = action.payload;
				const index = state.requests.indexOf(action.meta.arg.template_id);
				state.requests.splice(index, 1);
			})
			.addCase(craftTool.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				const index = state.requests.indexOf(action.meta.arg.template_id);
				state.requests.splice(index, 1);
			})

			.addCase(getTransaction.pending, (state, action) => {
				state.miningStatus = 'loading';
			})
			.addCase(getTransaction.fulfilled, (state, action) => {
				state.miningStatus = 'loaded';
				state.response = action.payload;
			})
			.addCase(getTransaction.rejected, (state, action) => {
				state.miningStatus = 'failed';
				state.error = action.error.message;
			})
			.addCase(getCraftTransaction.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getCraftTransaction.fulfilled, (state, action) => {
				state.status = 'loaded';
				state.response = action.payload;
			})
			.addCase(getCraftTransaction.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			});
	},
});
export const {
	getCard,
	chooseCard,
	chooseUsingCard,
	repairCard,
	chooseCraft,
	UpdateDurability,
	UpdateTimestamp,
	chooseUsingCardById,
} = toolsSlice.actions;

export default toolsSlice.reducer;
