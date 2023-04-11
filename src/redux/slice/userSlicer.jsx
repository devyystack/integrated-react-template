/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { game } from './authSlicer';
import { isRepeatable } from '../../utils';
export const getPlayerInfo = createAsyncThunk(
	'user/getPlayerInfo',
	async () => {
		for (let count = 0; count < 3; count++) {
			try {
				const userInfo = await game.getPlayerInfo();
				return userInfo;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;
				throw error;
			}
		}
	}
);

export const recover = createAsyncThunk('user/recover', async (oxygen) => {
	for (let count = 0; count < 3; count++) {
		try {
			const response = await game.recover(oxygen);
			return response;
		} catch (error) {
			if (isRepeatable(error.message) && count < 2) continue;
			throw error;
		}
	}
});

export const UserSlicer = createSlice({
	name: 'user',
	initialState: {
		status: 'idle',
		balances: {},
		info: {
			energy: 0,
			max_energy: 500,
		},
		error: null,
	},
	reducers: {
		updateRepairMoney: (state, action) => {
			state.balances.plasma -= action.payload;
		},
		updateBalance: (state, action) => {
			if (action.payload !== undefined) {
				const parsedResources = action.payload.split(' and ');
				parsedResources.forEach((resource) => {
					const parsed = resource.split(' ');
					state.balances[parsed[1].toLowerCase()] =
						parseFloat(state.balances[parsed[1].toLowerCase()]) +
						parseFloat(parsed[0]);
				});
			}
		},
		UpdateHealth: (state, action) => {
			if (action.payload?.type === 'plus') {
				state.info.energy =
					parseInt(state.info.energy) + parseInt(action.payload.value);
			} else
				state.info.energy =
					parseInt(state.info.energy) - parseInt(action.payload);
		},
	},
	extraReducers: (builder) => {
		builder

			.addCase(getPlayerInfo.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getPlayerInfo.fulfilled, (state, action) => {
				state.status = 'loaded';
				state.info = action.payload[0];
				for (let token in action.payload[0]?.balances) {
					const parsedToken = action.payload[0].balances[token].split(' ');
					if (parsedToken[0].includes('.')) {
						state.balances[parsedToken[1].toLowerCase()] = parseFloat(
							parsedToken[0]
						).toFixed(4);
					}
				}
			})
			.addCase(getPlayerInfo.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(recover.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(recover.fulfilled, (state, action) => {
				state.status = 'loaded';
				state.response = action.payload;
			})
			.addCase(recover.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			});
	},
});
export const selectUserInfo = (state) => state.user.info;
export const selectBalances = (state) => state.user.balances;

export const { updateRepairMoney, updateBalance, UpdateHealth } =
	UserSlicer.actions;

export default UserSlicer.reducer;
