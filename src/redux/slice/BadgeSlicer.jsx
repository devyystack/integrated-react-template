/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { game } from './authSlicer';
import { lockFeature, MAIN_SERVERURL } from '../../config';
import { isRepeatable, sleep, timeout } from '../../utils';

const mapMintResources = {
	PLASMA: 'plasma_mint',
	OXYGEN: 'oxygen_mint',
	ASTEROI: 'asteroid_mint', // updated by    original: ASTEROID
};

export const getUsingBadge = createAsyncThunk(
	'badge/getUsingBadge',
	async () => {
		const usingBadge = await game.getUsingBadge();
		return usingBadge;
	}
);

export const getBadgeConfig = createAsyncThunk(
	'badge/getBadgeConfig',
	async () => {
		const BadgeConfig = await game.getBadgeConfig();
		return BadgeConfig;
	}
);

export const mbsUnstake = createAsyncThunk(
	'badge/mbsUnstake',
	async (item_id, { getState, rejectWithValue }) => {
		const { auth } = getState();
		let isVerify = auth.authSettings.features & lockFeature[1].value;
		const isUnlocked2FA = auth.isUnlocked2FA;
		if (isVerify) {
			if (!isUnlocked2FA)
				return rejectWithValue('You have to Unlock 2FA to use this Feature!');
		}

		for (let count = 0; count < 3; count++) {
			try {
				const response = await game.authRequiredTransaction(
					game.verify2fa(isVerify),
					game.mbsUnstake(item_id)
				);
				return response;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;

				throw error;
			}
		}
	}
);
export const mbsCraft = createAsyncThunk(
	'badge/mbsCraft',
	async (template, { getState, rejectWithValue }) => {
		const { auth } = getState();
		let isVerify = auth.authSettings.features & lockFeature[2].value;
		const isUnlocked2FA = auth.isUnlocked2FA;
		if (isVerify) {
			if (!isUnlocked2FA)
				return rejectWithValue('You have to Unlock 2FA to use this Feature!');
		}

		for (let count = 0; count < 3; count++) {
			try {
				const response = await game.authRequiredTransaction(
					game.verify2fa(isVerify),
					game.mbsCraft(template)
				);
				return response;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;

				throw error;
			}
		}
	}
);
export const mbsClaimAsset = createAsyncThunk(
	'badge/mbsClaimAsset',
	async (asset_id, { getState }) => {
		if (asset_id === false) {
			const { game } = getState();
			asset_id = game.claimAssets;
		}
		for (let count = 0; count < 5; count++) {
			try {
				for (let index in asset_id) {
					await game.mbsClaimAsset(asset_id[index]);
				}
				return true;
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
	}
);

export const getBadgeCraft = createAsyncThunk(
	'badge/getBadgeCraft',
	async () => {
		const BadgeCraft = await game.getBadgeCraft();
		return BadgeCraft;
	}
);

export const mbsClaim = createAsyncThunk('badge/mbsClaim', async (asset_id) => {
	for (let count = 0; count < 3; count++) {
		try {
			const response = await game.mbsClaim(asset_id);
			return response;
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
});

export const getMbsTransaction = createAsyncThunk(
	'badge/getMbsTransaction',
	async (transaction_id) => {
		let response = {};
		let flag = false;
		let SERVER_URL = [...MAIN_SERVERURL];

		for (let count = 0; count < MAIN_SERVERURL.length * 5; count++) {
			await sleep(200);
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
					let amount = '';
					let bonus = '';
					response.actions.forEach((action) => {
						if (action.act.name === 'logbonus') bonus = action;
						if (action.act.name === 'logmbsclaim') amount = action;
					});
					response = { bonus: bonus, amount: amount };
					if (
						bonus.act?.name === 'logbonus' &&
						amount.act?.name === 'logmbsclaim'
					)
						flag = true;
					else continue;
				}
				if (flag !== false) return response;
			} catch (error) {
				SERVER_URL.splice(count % SERVER_URL.length, 1);
				count--;
				if (SERVER_URL.length === 0)
					throw new Error(`Claim successfully. You got your rewards`);

				continue;
			}
		}
		throw new Error(`Claim successfully. You got your rewards`);
	}
);

export const getMbsCraftTransaction = createAsyncThunk(
	'badge/getMbsCraftTransaction',
	async (transaction_id) => {
		let response = {};
		let flag = false;
		let SERVER_URL = [...MAIN_SERVERURL];
		let result = {};
		for (let count = 0; count < MAIN_SERVERURL.length * 5; count++) {
			await sleep(200);
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

				for (const action of response.actions) {
					if (action.act?.name === 'logmint') {
						result = action.act.data;
						flag = true;
					}
				}

				if (flag !== false) return result;
			} catch (error) {
				SERVER_URL.splice(count % SERVER_URL.length, 1);
				count--;
				if (SERVER_URL.length === 0)
					throw new Error(`Craft successfully. You got your membership card!`);

				continue;
			}
		}
		throw new Error(`Craft successfully. You got your membership card!`);
	}
);

export const BadgeSlice = createSlice({
	name: 'Badge',
	initialState: {
		usingBadges: [],
		badgeChest: [],
		badgeConfigs: [],
		badgeCraft: [],
		status: 'idle',
		error: '',
	},
	reducers: {
		getMbsTemplate: (state, action) => {
			let temp = [...state.badgeConfigs];
			for (let index in temp) {
				if (temp[index].template_id === action.payload) return temp[index];
			}
			return null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getUsingBadge.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getUsingBadge.fulfilled, (state, action) => {
				let tempUsingBadges = [];
				action.payload.forEach((item) => {
					let temp = state.badgeConfigs.find(
						(badge) => badge.template_id === item.template_id
					);
					tempUsingBadges.push({ ...temp, ...item });
					// tempUsingBadges[tempUsingBadges.length - 1].unstaking_time = item.unstaking_time
				});
				state.usingBadges = tempUsingBadges;
				state.status = 'loaded';
			})
			.addCase(getUsingBadge.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(getBadgeConfig.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getBadgeConfig.fulfilled, (state, action) => {
				state.status = 'loaded';
				let tempBadgeConfig = [];
				for (let index in action.payload) {
					tempBadgeConfig.push(action.payload[index]);
					tempBadgeConfig[index].plasmas_mint = parseFloat(
						tempBadgeConfig[index].plasmas_mint.split(' ')[0]
					);
				}
				state.badgeConfigs = tempBadgeConfig;
			})
			.addCase(getBadgeConfig.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(mbsClaimAsset.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(mbsClaimAsset.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(mbsClaimAsset.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})

			.addCase(getBadgeCraft.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getBadgeCraft.fulfilled, (state, action) => {
				state.status = 'loaded';
				let tempBadgeConfig = [];
				for (let index in action.payload) {
					action.payload[index].reward = action.payload[index].rewards_rate;

					delete action.payload[index].rewards_rate;
					tempBadgeConfig.push(action.payload[index]);
					for (let mintIndex in tempBadgeConfig[index].mints) {
						const parsed = tempBadgeConfig[index].mints[mintIndex].split(' ');
						tempBadgeConfig[index][mapMintResources[parsed[1]]] = parseInt(
							parsed[0]
						);
					}
					// tempBadgeConfig[index].plasmas_mint = parseFloat(
					// 	tempBadgeConfig[index].plasmas_mint.split(' ')[0]
					// );
				}
				state.badgeCraft = tempBadgeConfig;
			})
			.addCase(getBadgeCraft.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})

			.addCase(mbsCraft.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(mbsCraft.fulfilled, (state, action) => {
				state.status = 'loaded';
				console.log('mbsCraft.fulfilled', action.payload);
			})
			.addCase(mbsCraft.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(mbsClaim.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(mbsClaim.fulfilled, (state, action) => {
				state.status = 'loaded';
				console.log('mbsClaim.fulfilled', action.payload);
			})
			.addCase(mbsClaim.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})

			.addCase(getMbsTransaction.pending, (state, action) => {
				state.transactionStatus = 'loading';
			})
			.addCase(getMbsTransaction.fulfilled, (state, action) => {
				state.transactionStatus = 'loaded';
				state.response = action.payload;
			})
			.addCase(getMbsTransaction.rejected, (state, action) => {
				state.transactionStatus = 'failed';
				state.error = action.error.message;
			})

			.addCase(getMbsCraftTransaction.pending, (state, action) => {
				state.transactionStatus = 'loading';
			})
			.addCase(getMbsCraftTransaction.fulfilled, (state, action) => {
				state.transactionStatus = 'loaded';
				state.response = action.payload;
			})
			.addCase(getMbsCraftTransaction.rejected, (state, action) => {
				state.transactionStatus = 'failed';
				state.error = action.error.message;
			});
	},
});
export const { getMbsTemplate } = BadgeSlice.actions;

export default BadgeSlice.reducer;
