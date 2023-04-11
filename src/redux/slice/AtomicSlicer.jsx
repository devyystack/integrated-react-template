/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { game } from './authSlicer';

import { MAIN_SERVERURL } from '../../config';
import { timeout } from '../../utils';

// eslint-disable-next-line no-extend-native
Object.defineProperty(Array.prototype, 'chunk_inefficient', {
	value: function (chunkSize) {
		var array = this;
		return [].concat.apply(
			[],
			array.map(function (elem, i) {
				return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
			})
		);
	},
});

export const getRefundItem = createAsyncThunk(
	'atomic/getRefundItem',
	async () => {
		return await game.getRefundItem();
	}
);

export const getRefund = createAsyncThunk(
	'atomic/getRefund',
	async (x, { getState }) => {
		for (let count = 0; count < 3; count++) {
			try {
				const { atomic } = getState();

				const response = await game.getRefund(
					atomic.refundChest['idList'].chunk_inefficient(5)
				);
				return response;
			} catch (error) {
				if (
					(error?.message?.includes('undefined') ||
						error?.message?.includes('Failed to fetch')) &&
					count < 2
				)
					continue;
				throw error;
			}
		}
	}
);

export const getExchangeTransactions = createAsyncThunk(
	'atomic/getExchangeTransactions',
	async () => {
		let response = {};
		let SERVER_URL = [...MAIN_SERVERURL];
		let result = [];
		let idList = [];
		for (let index in idList) {
			let transaction_id = idList[index];
			for (let count = 0; count < MAIN_SERVERURL.length * 5; count++) {
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
						let burn = '';
						response.actions.forEach((action) => {
							if (action.act.name === 'logburnrs') {
								burn = action.act.data?.rewards || 0;
								return;
							}
						});
						result.push(burn);
						break;
					}
				} catch (error) {
					SERVER_URL.splice(count % SERVER_URL.length, 1);
					count--;
					if (SERVER_URL.length === 0)
						throw new Error(`Cannot display what you got!`);

					continue;
				}
			}
		}
		console.log(result);
	}
);

export const getAtomicChest = createAsyncThunk(
	'atomic/getAtomicChest',
	async () => {
		return await game.getItems('326166'); // updated by  template id for NFTs in atomicHub
	}
);
export const getCoin = createAsyncThunk('atomic/getCoin', async () => {
	return await game.getTemplaasds();
});

// const canWear = ['plants', 'tools', 'farmbuilding']; // updated by
const canWear = ['tools'];

export const getChestAssetsByTemplate = (state, template_id) => {
	const assets = state.filter(
		(oxygen) => oxygen.template.template_id === template_id + ''
	);
	return assets[0]?.idList;
};
export const getFirstBuilding = (state, template_id) =>
	state.farmbuilding?.find(
		(building) => building.template?.template_id + '' === template_id
	);
export const atomicSlice = createSlice({
	name: 'atomic',
	initialState: {
		plants: [],
		memberships: [],
		farmanimals: [],
		tools: [],
		packs: [],
		galaxycoins: [],
		farmbuilding: [],
		oxygens: [],
		refundConf: [],
		tickets: [],
		refundChest: {
			idList: [],
		},
		refundAmount: 0,
		status: 'idle',
		response: '',
		error: '',
	},
	reducers: {
		popAsset: (state, action) => {
			let x = action.payload;
			const [...temp] = state[x.schema.schema_name];
			temp.forEach((obj, i) => {
				if (obj.template.template_id === x.template.template_id) {
					let [...tempIdList] = x.idList;
					tempIdList.shift();
					obj.idList = tempIdList;
					obj.total = obj.total - 1;
				}
			});
			state[x.schema.schema_name] = temp;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getAtomicChest.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getAtomicChest.fulfilled, (state, action) => {
				let tempSchema = [];
				let tempChest = {};
				let tempRefund = [];
				state.refundChest = [];
				state.plants = [];
				state.memberships = [];
				state.farmanimals = [];
				state.tools = [];
				state.packs = [];
				state.galaxycoins = [];
				state.farmbuilding = [];
				state.oxygens = [];
				action.payload.forEach((payload) => {
					if (state.refundConf.includes(payload.asset_id)) {
						state.refundChest = payload;
						tempRefund.push(payload.asset_id);
						state.refundChest['isRefundable'] = true;
						return;
					}
					if (!tempChest[payload.schema.schema_name]) {
						tempChest[payload.schema.schema_name] = {};
					}
					if (
						!tempChest[payload.schema.schema_name][payload.template.template_id]
					) {
						tempChest[payload.schema.schema_name][payload.template.template_id] = Object.assign({}, payload);
						if (canWear.includes(payload.schema.schema_name)) {
							tempChest[payload.schema.schema_name][payload.template.template_id]['isWearable'] = true;
						}
						// if (payload.data.unpack) {
						// 	if (payload.data.unpack.toLowerCase() === 'in game') {
						// 		tempChest[payload.schema.schema_name][payload.template.template_id]['isOpenable'] = true;
						// 	} else
						// 		tempChest[payload.schema.schema_name][payload.template.template_id]['isOpenLink'] = true;
						// }
						if (payload.schema.schema_name.toLocaleLowerCase() == 'packs' && (payload.name != "Base Portal" || payload.name != "Advanced Portal")) { // added by
							tempChest[payload.schema.schema_name][payload.template.template_id]['isOpenable'] = true;
						}
						if (payload.data.type && payload.data.type !== 'Random') {
							tempChest[payload.schema.schema_name][payload.template.template_id]['isWearable'] = true;
						}
						if (payload.schema.schema_name === 'farmanimals') {
							if (!(payload.data.sex === 'Random')) {
								tempChest[payload.schema.schema_name][payload.template.template_id]['isWearable'] = true;
							} else {
								tempChest[payload.schema.schema_name][payload.template.template_id]['isOpenLink'] = true;
							}
						}
						if (payload.schema.schema_name === 'timemachines') {
							// if (payload.data.type === 'Random') {
							// }
							// if (payload.name.toLocaleLowerCase() != 'empty scrap time machine' && payload.name.toLocaleLowerCase() != 'empty obsidian time machine' && payload.name.toLocaleLowerCase() != 'empty unidentified time machine') {
								tempChest[payload.schema.schema_name][payload.template.template_id]['isOpenLink'] = true;
								state.memberships.push(tempChest[payload.schema.schema_name][payload.template.template_id]);
							// }
						}

						if (payload.schema.schema_name.toLocaleLowerCase() == 'tools') { // added by
							state.tools.push(tempChest[payload.schema.schema_name][payload.template.template_id]) 
						} else if (payload.schema.schema_name.toLocaleLowerCase() == 'packs' && (payload.name != "Base Portal" || payload.name != "Advanced Portal")) {
							state.packs.push(tempChest[payload.schema.schema_name][payload.template.template_id]) 
						}
						
					}
					if (
						!tempChest[payload.schema.schema_name][payload.template.template_id]['idList']
					) {
						tempChest[payload.schema.schema_name][payload.template.template_id]['idList'] = [];
					}
					tempChest[payload.schema.schema_name][payload.template.template_id]['idList'].push(payload.asset_id);
					if (!tempSchema.includes(payload.schema.schema_name))
					tempSchema.push(payload.schema.schema_name);
				});
				tempSchema.forEach((name) => {
					state[name] = [];
					const templateIds = Object.keys(tempChest[name]);
					templateIds.forEach((template, i) => {
						state[name].push(tempChest[name][template]);
						state[name][i]['total'] =
						tempChest[name][template]['idList'].length;
					});
				});
				state.refundChest['idList'] = tempRefund;
				state.refundChest['total'] = tempRefund.length;
				state.status = 'loaded';
			})
			.addCase(getAtomicChest.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})

			.addCase(getRefundItem.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getRefundItem.fulfilled, (state, action) => {
				if (action.payload[0]) {
					state.refundConf = action.payload[0].asset_ids;
					state.refundAmount = action.payload[0].reward;
				}
				state.status = 'loaded';
			})
			.addCase(getRefundItem.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(getExchangeTransactions.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getExchangeTransactions.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(getExchangeTransactions.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			});
	},
});
export const { popAsset } = atomicSlice.actions;

export default atomicSlice.reducer;
