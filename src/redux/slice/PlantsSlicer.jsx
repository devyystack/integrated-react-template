/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { game } from './authSlicer';
import { MAIN_SERVERURL } from '../../config';
import { sleep, timeout } from '../../utils';

export const getUsingPlants = createAsyncThunk(
	'plants/getUsingPlants',
	async () => {
		const itemList = await game.getUsingPlants();
		return itemList;
	}
);

export const getTransaction = createAsyncThunk(
	'plants/getTransaction',
	async (transaction_id) => {
		let response = {};
		let flag = false;
		let SERVER_URL = [...MAIN_SERVERURL];

		for (let count = 0; count < MAIN_SERVERURL.length * 8; count++) {
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
					let claim = {};
					let {actions} = response
					for (let index = 0; index < actions.length; index++) {
						if (actions[index].act.name === 'logclaimrs') {
							claim = actions[index].act?.data.data;
						
							response = { claim: claim };
							if (claim.reward_card && claim.quantity) flag = true;
						}
					}
				}
				if (flag !== false) return response;
			} catch (error) {
				SERVER_URL.splice(count % SERVER_URL.length, 1);
				count--;
				if (SERVER_URL.length === 0) throw new Error(`You got your harvest!`);
				continue;
			}
		}
		throw new Error(`You got your harvest!`);
	}
);

export const cropClaim = createAsyncThunk(
	'plants/cropClaim',
	async (item_id) => {
		for (let count = 0; count < 3; count++) {
			try {
				let respond = await game.cropClaim(item_id);
				return respond;
			} catch (error) {
				console.log('error ', error);

				if (
					(error?.message?.includes('undefined') ||
						error?.message?.includes('Failed to fetch')) &&
					count < 2
				)
					continue;
				throw error;
			}
		}
	},
	{
		condition: (item_id, { getState, extra }) => {
			const { plants } = getState();
			const fetchStatus = plants.requests.filter(
				(__item_id) => __item_id === item_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const getPlantsConfig = createAsyncThunk(
	'plants/getPlantsConfig',
	async () => {
		const plantsConfig = await game.getPlantsConfig();
		return plantsConfig;
	}
);

export const PlantsSlicer = createSlice({
	name: 'plants',
	initialState: {
		plantsTemplate: [],
		plantsConfig: [],
		plantsUsing: [],
		status: 'idle',
		response: '',
		requests: [],
		error: '',
	},
	reducers: {
		UpdateTimestamp: (state, action) => {
			state.plantsUsing.forEach((item) => {
				if (item.asset_id === action.payload) {
					item.next_availability =
						Date.now() / 1000 + parseInt(item.charge_time);
				}
			});
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getPlantsConfig.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getPlantsConfig.fulfilled, (state, action) => {
				state.status = 'loaded';
				state.plantsConfig = action.payload;
			})
			.addCase(getPlantsConfig.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(getUsingPlants.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getUsingPlants.fulfilled, (state, action) => {
				state.status = 'loaded';

				let tempUsingItems = [];
				for (let item in action.payload) {
					const temp = state.plantsConfig.find(
						(conf) => conf.template_id === action.payload[item].template_id
					);
					tempUsingItems.push(Object.assign(action.payload[item], temp));
				}
				state.plantsUsing = tempUsingItems;
			})
			.addCase(getUsingPlants.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})

			.addCase(cropClaim.pending, (state, action) => {
				state.status = 'loading';
				state.requests.push(action.meta.arg);
			})
			.addCase(cropClaim.fulfilled, (state, action) => {
				state.status = 'loaded';

				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(cropClaim.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;

				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(getTransaction.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getTransaction.fulfilled, (state, action) => {
				state.status = 'loaded';
				state.response = action.payload;
			})
			.addCase(getTransaction.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			});
	},
});
export const { UpdateTimestamp } = PlantsSlicer.actions;

export default PlantsSlicer.reducer;
