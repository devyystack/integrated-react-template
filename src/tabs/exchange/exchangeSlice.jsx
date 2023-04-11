/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { game } from '../../redux/slice/authSlicer';
import { lockFeature } from '../../config';
import { isRepeatable } from '../../utils';
export const withdraw = createAsyncThunk(
	'exchange/withdraw',
	async (data, { getState, rejectWithValue }) => {
		for (let count = 0; count < 3; count++) {
			try {
				const response = await game.withdrawMe(data.plasma, data.oxygen, data.asteroid, data.fee)
				return response;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;
				throw error;
			}
		}

		// const { auth } = getState();
		// let isVerify = auth.authSettings.features & lockFeature[0].value;
		// const isUnlocked2FA = auth.isUnlocked2FA;
		// if (isVerify) {
		// 	if (!isUnlocked2FA)
		// 		return rejectWithValue('You have to Unlock 2FA to use this Feature!');
		// }

		// for (let count = 0; count < 3; count++) {
		// 	try {
		// 		const response = await game.authRequiredTransaction(
		// 			game.verify2fa(isVerify),
		// 			game.withdraw(data.plasma, data.oxygen, data.asteroid, data.fee)
		// 		);
		// 		return response;
		// 	} catch (error) {
		// 		if (isRepeatable(error.message) && count < 2) continue;
		// 		throw error;
		// 	}
		// }
	}
);

export const deposit = createAsyncThunk('exchange/deposit', async (data) => {
	for (let count = 0; count < 3; count++) {
		try {
			const response = await game.deposit(data.plasma, data.oxygen, data.asteroid);
			// const response = await game.depositMe(data.plasma, data.oxygen, data.asteroid);
			return response;
		} catch (error) {
			if (isRepeatable(error.message) && count < 2) continue;
			throw error;
		}
	}
});

export const getConfigs = createAsyncThunk('exchange/getConfigs', async () => {
	const config = await game.getConfig();
	return config;
});
export const getTokens = createAsyncThunk('exchange/getTokens', async () => {
	const tokens = await game.getTokens();
	return tokens;
});

export const selectTabData = (state) => state.data[state.selectedTab];

export const ExchangeSlice = createSlice({
	name: 'exchange',
	initialState: {
		tax: 5,
		data: [
			{
				plasma: 0,
				asteroid: 0,
				oxygen: 0,
			},
			{
				plasma: 0,
				asteroid: 0,
				oxygen: 0,
			},
		],
		tokens: {},
		newTaxTime: '',
		status: 'idle',
		fetchdata: 'idle',
		error: '',
		response: '',
		selectedTab: 0,
	},
	reducers: {
		chooseTab: (state, action) => {
			state.selectedTab = action.payload;
		},
		changeData: (state, action) => {
			const tempChange = {
				...state.data[state.selectedTab],
				...action.payload,
			};
			state.data[state.selectedTab] = tempChange;
		},
		resetChange: (state, action) => {
			state.data[state.selectedTab].oxygen = 0;
			state.data[state.selectedTab].asteroid = 0;
			state.data[state.selectedTab].plasma = 0;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(withdraw.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(withdraw.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(withdraw.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})

			.addCase(deposit.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(deposit.fulfilled, (state, action) => {
				state.status = 'loaded';

				console.log('deposit', action.payload);
				// console.log("depositlenght", state.usingLength)
			})
			.addCase(deposit.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(getTokens.pending, (state, action) => {
				state.fetchdata = 'loading';
			})
			.addCase(getTokens.fulfilled, (state, action) => {
				state.fetchdata = 'loaded';
				for (let token in action.payload) {
					const parsedToken = action.payload[token].split(' ');

					state.tokens[parsedToken[1]] = parsedToken[0];
				}
			})
			.addCase(getTokens.rejected, (state, action) => {
				state.fetchdata = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(getConfigs.pending, (state, action) => {
				state.fetchdata = 'loading';
			})
			.addCase(getConfigs.fulfilled, (state, action) => {
				state.fetchdata = 'loaded';
				state.tax = action.payload[0].fee;
			})
			.addCase(getConfigs.rejected, (state, action) => {
				state.fetchdata = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			});
	},
});
export const { changeData, chooseTab, resetChange } = ExchangeSlice.actions;

export default ExchangeSlice.reducer;
