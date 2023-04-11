/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { lockFeature } from '../../config';
import { isRepeatable } from '../../utils';
import { game } from './authSlicer';

export const marketBuy = createAsyncThunk(
	'market/marketBuy',
	async ({ template_id, quantity }, { getState, rejectWithValue }) => {
		const { auth } = getState();
		let isVerify = auth.authSettings.features & lockFeature[3].value;
		const isUnlocked2FA = auth.isUnlocked2FA;
		if (isVerify) {
			if (!isUnlocked2FA)
				return rejectWithValue('You have to Unlock 2FA to use this Feature!');
		}
		for (let count = 0; count < 3; count++) {
			try {
				const response = await game.authRequiredTransaction(
					game.verify2fa(isVerify),
					game.marketBuy(template_id, quantity)
				);
				return response;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;

				throw error;
			}
		}
	},
	{
		condition: (template_id, { getState, extra }) => {
			const { market } = getState();
			const fetchStatus = market.requests.filter(
				(__template_id) => __template_id === template_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const getMarketConf = createAsyncThunk(
	'market/getMarketConf',
	async () => {
		const response = await game.getMarketConf();
		return response;
	}
);

// Building section
export const marketSlicer = createSlice({
	name: 'market',
	initialState: {
		marketConfig: [],
		requests: [],
		status: 'idle',
		error: '',
	},
	reducers: {},
	extraReducers: (builder) => {
		builder

			.addCase(getMarketConf.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getMarketConf.fulfilled, (state, action) => {
				state.status = 'loaded';
				let tempMkt = [];
				action.payload.forEach((payload, index) => {
					const price = parseFloat(payload.cost[0].split(' ')[0]).toFixed();
					tempMkt.push(payload);
					tempMkt[index].price = price;
				});
				state.marketConfig = tempMkt;
			})
			.addCase(getMarketConf.rejected, (state, action) => {
				state.status = 'rejected';
				state.error = action.error.message;
			})

			.addCase(marketBuy.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(marketBuy.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(marketBuy.rejected, (state, action) => {
				state.status = 'rejected';
				state.error = action.error.message;
			});
	},
});
// export const {} = marketSlicer.actions;

export default marketSlicer.reducer;
