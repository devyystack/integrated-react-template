/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { game } from './authSlicer';
import { coinScheme } from '../../config';
export const getCoin = createAsyncThunk('coins/getCoin', async () => {
	return await game.getItemsBySchema(coinScheme.main, 122);
});
export const getTotalCoin = createAsyncThunk('coins/getTotalCoin', async () => {
	const itemList = await game.countAssetBySchema(coinScheme.main);
	return itemList;
});

export const CoinSlice = createSlice({
	name: 'coins',
	initialState: {
		coinConfig: {
			total: 0,
			isWearable: false,
		},
		coinsId: [],
		totalCoin: 0,
		status: 'idle',
		error: '',
	},
	reducers: {
		getCard: (state, action) => {},
	},
	extraReducers: (builder) => {
		builder

			.addCase(getCoin.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getCoin.fulfilled, (state, action) => {
				state.status = 'loaded';
				let temp = state.coinConfig.total;
				state.coinConfig = action.payload[0] || {};
				if (state.coinConfig.asset_id) {
					state.coinConfig.isWearable = false;
					state.coinConfig.total = temp;
					state.coinsId = action.payload.map((item) => item.asset_id);
				} else {
					state.coinConfig = [];
				}
			})
			.addCase(getCoin.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(getTotalCoin.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getTotalCoin.fulfilled, (state, action) => {
				state.status = 'loaded';
				if (!Array.isArray(state.coinConfig)) {
					state.coinConfig.total = action.payload;
					state.totalCoin = action.payload;
				}
			})
			.addCase(getTotalCoin.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			});
	},
});
export const { getCard } = CoinSlice.actions;

export default CoinSlice.reducer;
