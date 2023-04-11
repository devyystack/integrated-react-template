/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { game } from './authSlicer';

export const startBreeding = createAsyncThunk(
	'breeding/startBreeding',
	async (data) => {
		for (let count = 0; count < 3; count++) {
			try {
				let respond = await game.breedingStart(data.dad, data.mother);
				return respond;
			} catch (error) {
				if (
					(error.message?.includes('undefined') ||
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
			const { breeding } = getState();
			const fetchStatus = breeding.requests.filter(
				(__item_id) => __item_id === data.animal
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const feedBreeding = createAsyncThunk(
	'breeding/feedBreeding',
	async (data) => {
		for (let count = 0; count < 3; count++) {
			try {
				let respond = await game.breedingClaim(
					data.dad,
					data.mother,
					data.oxygen[count % data.oxygen.length]
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
			const { breeding } = getState();
			const fetchStatus = breeding.requests.filter(
				(__item_id) => __item_id === data.animal
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);
export const cancelBreeding = createAsyncThunk(
	'breeding/cancelBreeding',
	async (mother_id) => {
		for (let count = 0; count < 3; count++) {
			try {
				let respond = await game.breedingCancel(mother_id);
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
		condition: (mother_id, { getState, extra }) => {
			const { breeding } = getState();
			const fetchStatus = breeding.requests.filter(
				(__item_id) => __item_id === mother_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const getBreedingConf = createAsyncThunk(
	'breeding/getBreedingConf',
	async () => {
		const EquipConfigs = await game.getBreedingConf();
		return EquipConfigs;
	}
);
export const getBreedings = createAsyncThunk(
	'breeding/getBreedings',
	async () => {
		return await game.getBreedings();
	}
);
export const getPair = (state, bearer_id, partner_id) =>
	state.breedings.find((breed) => breed.id === bearer_id);
export const BreedingSlice = createSlice({
	name: 'breeding',
	initialState: {
		breedingConfig: [],
		breedings: [],
		status: 'idle',
		isShowing: false,
		requests: [],
		error: '',
	},
	reducers: {
		setShow: (state, action) => {
			state.isShowing = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getBreedingConf.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getBreedingConf.fulfilled, (state, action) => {
				state.status = 'loaded';
				state.breedingConfig = action.payload;
			})
			.addCase(getBreedingConf.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(getBreedings.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getBreedings.fulfilled, (state, action) => {
				state.status = 'loaded';
				let tempBreedings = [];
				for (let item in action.payload) {
					const temp = state.breedingConfig.find(
						(conf) => conf.name === action.payload[item].name
					);
					tempBreedings.push(Object.assign(action.payload[item], temp));
				}
				state.breedings = tempBreedings;
			})
			.addCase(getBreedings.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(feedBreeding.pending, (state, action) => {
				state.status = 'loading';
				state.requests.push(action.meta.arg);
			})
			.addCase(feedBreeding.fulfilled, (state, action) => {
				state.status = 'loaded';
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(feedBreeding.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;

				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})

			.addCase(startBreeding.pending, (state, action) => {
				state.status = 'loading';
				state.requests.push(action.meta.arg);
			})
			.addCase(startBreeding.fulfilled, (state, action) => {
				state.status = 'loaded';
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(startBreeding.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;

				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})

			.addCase(cancelBreeding.pending, (state, action) => {
				state.status = 'loading';
				state.requests.push(action.meta.arg);
			})
			.addCase(cancelBreeding.fulfilled, (state, action) => {
				state.status = 'loaded';
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(cancelBreeding.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;

				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			});
	},
});
export const { setShow } = BreedingSlice.actions;

export default BreedingSlice.reducer;
