/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { game } from './authSlicer';
import { MAIN_SERVERURL } from '../../config';
import { sleep, timeout } from '../../utils';

export const getUsingAnimals = createAsyncThunk(
	'animals/getUsingAnimals',
	async () => {
		const itemList = await game.getUsingAnimals();
		return itemList;
	}
);

export const feedAnimal = createAsyncThunk(
	'animals/feedAnimal',
	async (data) => {
		for (let count = 0; count < 3; count++) {
			try {
				let respond = await game.feedAnimal(
					data.animal,
					data.oxygen[count % data.oxygen?.length || 0]
				);
				return respond;
			} catch (error) {
				if (
					(error.message?.includes('undefined') ||
						error.includes("Sender doesn't ") ||
						error.message?.includes('Failed to fetch')) &&
					count < 2
				)
					continue;
				throw error;
			}
		}
	},
	{
		condition: (data, { getState, extra }) => {
			const { animals } = getState();
			const fetchStatus = animals.requests.filter(
				(__item_id) => __item_id === data.animal
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);
export const careAnimal = createAsyncThunk(
	'animals/careAnimal',
	async (data) => {
		for (let count = 0; count < 3; count++) {
			try {
				let respond = await game.careAnimal(data);
				return respond;
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
	},
	{
		condition: (data, { getState, extra }) => {
			const { animals } = getState();
			const fetchStatus = animals.requests.filter(
				(__item_id) => __item_id === data.animal
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const getTransaction = createAsyncThunk(
	'animals/getTransaction',
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
						if (response.actions[index].act.name === 'logclaimrs') {
							claim = response.actions[index].act?.data.data;
							result = { claim: claim };
							if (claim.reward_card && claim.quantity) flag = true;
						}
					}
				}
				if (flag !== false) return result;
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

export const getAnimalsConf = createAsyncThunk(
	'animals/getAnimalsConf',
	async () => {
		const EquipConfigs = await game.getAnimalsConf();
		return EquipConfigs;
	}
);

const cowsTemplate = [298597, 298599, 298600, 298607, 298611, 298598];
const chickenTemplate = [298612, 298613, 298614];

// const cowsTemplate = [298597, 298599, 298600, 298607, 298611, 298598];
// const chickenTemplate = [298612, 298613, 298614];

export const getEvolve = (state, template_id) =>
	state.animalsConfig.find((conf) => conf.template_id === template_id);

export const AnimalsSlice = createSlice({
	name: 'animals',
	initialState: {
		animalsConfig: [],
		cowUsing: [],
		chickenUsing: [],
		status: 'idle',
		requests: [],
		error: '',
	},
	reducers: {
		UpdateTimestamp: (state, action) => {
			state.cowUsing.map((item) => {
				if (item.asset_id === action.payload) {
					item.next_availability =
						Date.now() / 1000 + parseInt(item.charge_time);
				}
				return true;
			});
			state.chickenUsing.map((item) => {
				if (item.asset_id === action.payload) {
					item.next_availability =
						Date.now() / 1000 + parseInt(item.charge_time);
				}
				return true;
			});
		},
	},
	extraReducers: (builder) => {
		builder

			.addCase(getAnimalsConf.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getAnimalsConf.fulfilled, (state, action) => {
				state.status = 'loaded';
				state.animalsConfig = action.payload;
			})
			.addCase(getAnimalsConf.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(getUsingAnimals.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getUsingAnimals.fulfilled, (state, action) => {
				state.status = 'loaded';
				let tempCow1 = action.payload.filter((item) =>
					cowsTemplate.includes(item.template_id)
				);
				let tempChicken1 = action.payload.filter((item) =>
					chickenTemplate.includes(item.template_id)
				);
				let tempCow2 = [];
				let tempChicken2 = [];
				for (let item in tempCow1) {
					const temp = state.animalsConfig.find(
						(conf) => conf.template_id === tempCow1[item].template_id
					);
					tempCow2.push(Object.assign(tempCow1[item], temp));
				}
				for (let item in tempChicken1) {
					const temp = state.animalsConfig.find(
						(conf) => conf.template_id === tempChicken1[item].template_id
					);
					tempChicken2.push(Object.assign(tempChicken1[item], temp));
				}
				state.cowUsing = tempCow2;
				state.chickenUsing = tempChicken2;
			})
			.addCase(getUsingAnimals.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})

			.addCase(feedAnimal.pending, (state, action) => {
				state.status = 'loading';
				state.requests.push(action.meta.arg);
			})
			.addCase(feedAnimal.fulfilled, (state, action) => {
				state.status = 'loaded';
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(feedAnimal.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;

				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(careAnimal.pending, (state, action) => {
				state.status = 'loading';
				state.requests.push(action.meta.arg);
			})
			.addCase(careAnimal.fulfilled, (state, action) => {
				state.status = 'loaded';
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(careAnimal.rejected, (state, action) => {
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
export const { UpdateTimestamp } = AnimalsSlice.actions;

export default AnimalsSlice.reducer;
