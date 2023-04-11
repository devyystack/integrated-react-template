/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { game } from './authSlicer';
import { MAIN_SERVERURL, lockFeature } from '../../config';
import { sleep, timeout } from '../../utils';

export const getTransaction = createAsyncThunk(
	'oxygens/getTransaction',
	async (transaction_id) => {
		let response = {};
		let flag = false;
		let SERVER_URL = [...MAIN_SERVERURL];

		for (let count = 0; count < MAIN_SERVERURL.length * 5; count++) {
			await sleep(800);
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
						if (action.act.name === 'logburnrs')
							burn = action.act.data?.rewards;
					});
					response = { burn: burn };

					if (Array.isArray(burn)) flag = true;
					else continue;
				}
				if (flag !== false) return response;
			} catch (error) {
				SERVER_URL.splice(count % SERVER_URL.length, 1);
				count--;
				if (SERVER_URL.length === 0)
					throw new Error(`Cannot display what you got!`);

				continue;
			}
		}
		throw new Error(`Cannot display what you got!`);
	}
);

export const exchangeRewards = createAsyncThunk(
	'oxygens/exchangeRewards',
	async (asset_id, { getState, rejectWithValue }) => {
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
					game.exchangeRewards(asset_id)
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
	},
	{
		condition: (asset_id, { getState, extra }) => {
			const { oxygens } = getState();
			const fetchStatus = oxygens.requests.filter(
				(__asset_id) => __asset_id === asset_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const getExchangeConf = createAsyncThunk(
	'oxygens/getExchangeConf',
	async () => {
		const response = await game.getExchangeConf();
		return response;
	}
);

export const getOxygenName = (state, template_id) =>
	state.oxygensConfig.find((item) =>
		item.template_id === template_id ? item.name : ''
	);
export const getCanBurn = (state, template_id) =>
	state.oxygensConfig.map((item) => item.template_id + '');

export const OxygensSlicer = createSlice({
	name: 'oxygens',
	initialState: {
		oxygensConfig: [],
		requests: [],
		status: 'idle',
		response: '',
		error: '',
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
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
			})
			.addCase(getExchangeConf.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getExchangeConf.fulfilled, (state, action) => {
				state.status = 'loaded';
				state.oxygensConfig = action.payload;
			})
			.addCase(getExchangeConf.rejected, (state, action) => {
				state.status = 'rejected';
				state.error = action.error.message;
			})

			.addCase(exchangeRewards.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(exchangeRewards.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(exchangeRewards.rejected, (state, action) => {
				state.status = 'rejected';
				state.error = action.error.message;
			});
	},
});
export const { reOrderCard } = OxygensSlicer.actions;

export default OxygensSlicer.reducer;
