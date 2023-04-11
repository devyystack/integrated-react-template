/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTokens, getConfigs } from '../../tabs/exchange/exchangeSlice';
import { getPlayerInfo } from './userSlicer';
import { getUsingItems, getEquipConfigs } from './ToolsSlicer';
import { getBadgeConfig, getBadgeCraft, getUsingBadge } from './BadgeSlicer';
import { getBuildingConfig, getUsingBuilding } from './BuildingSlicer';
import { getAnimalsConf, getUsingAnimals } from './AnimalsSlicer';

import { game, getAuthSettings } from './authSlicer';
import { getMarketConf } from './MarketSlicer';
import { getUsingPlants, getPlantsConfig } from './PlantsSlicer';
import { getCoin, getTotalCoin } from './CoinSlicer';
import { getExchangeConf } from './OxygensSlicer';
import { getBreedingConf, getBreedings } from './BreedingSlicer';
import { getAtomicChest, getRefundItem } from './AtomicSlicer';

export const thunkUpdater = createAsyncThunk(
	'game/thunkUpdater',
	async (_, thunkApi) => {
		await thunkApi.dispatch(getRefundItem());
		await Promise.all([
			// thunkApi.dispatch(getExchangeTransactions()), // original: commenting
			// thunkApi.dispatch(getSchemas()),      // original: commenting
			thunkApi.dispatch(getEquipConfigs()),
			thunkApi.dispatch(getAtomicChest()), 
			thunkApi.dispatch(getPlayerInfo()),
			thunkApi.dispatch(getBadgeCraft()),
			// updated by    original: no commenting
			// thunkApi.dispatch(getExchangeConf()), 
			// thunkApi.dispatch(getBreedingConf()),
			// thunkApi.dispatch(getBuildingConfig()),
			// thunkApi.dispatch(getBadgeConfig()),
			// thunkApi.dispatch(getAnimalsConf()),
			// thunkApi.dispatch(getConfigs()),
			// thunkApi.dispatch(getMarketConf()),
			// thunkApi.dispatch(getPlantsConfig()),
			// thunkApi.dispatch(getWaxAccount()),
			// thunkApi.dispatch(getAccountToken()),
			// thunkApi.dispatch(getCoin()),
			// thunkApi.dispatch(getAuthSettings()),
			// thunkApi.dispatch(mbsGetUnclaimedAsset()), 
			// end
		]);
		await Promise.all([
			thunkApi.dispatch(getUsingBadge()), 
			thunkApi.dispatch(getTokens()),
			thunkApi.dispatch(getUsingItems()),
			thunkApi.dispatch(getUsingBuilding()),
			thunkApi.dispatch(getUsingAnimals()),
			thunkApi.dispatch(getTotalCoin()),
			thunkApi.dispatch(getUsingPlants()),
			thunkApi.dispatch(getBreedings()), 
		]);
	}
);
export const backgroundUpdate = createAsyncThunk(
	'game/backgroundUpdate',
	async (_, thunkApi) => {
		return await Promise.all([
			thunkApi.dispatch(getAtomicChest()),
			thunkApi.dispatch(getPlayerInfo()),
			thunkApi.dispatch(getUsingItems()),
			thunkApi.dispatch(getUsingBadge()),
			thunkApi.dispatch(getUsingBuilding()),
			thunkApi.dispatch(getTokens()),
			thunkApi.dispatch(getUsingPlants()),
			thunkApi.dispatch(getUsingAnimals()),
			thunkApi.dispatch(getCoin()),
			thunkApi.dispatch(getBreedings()),
			thunkApi.dispatch(getTotalCoin()),
			thunkApi.dispatch(getAuthSettings()),
		]);
	}
);

export const mbsGetUnclaimedAsset = createAsyncThunk(
	'gae/mbsGetUnclaimedAsset',
	async () => {
		const response = await game.mbsGetUnclaimedAsset();
		return response;
	}
);

export const getWaxAccount = createAsyncThunk(
	'game/getWaxAccount',
	async () => {
		const response = await game.getWaxAccount();
		return response;
	}
);
export const getAccountToken = createAsyncThunk(
	'game/getAccountToken',
	async () => {
		const response = await game.getAccountToken();
		return response;
	}
);

export const getSchemas = createAsyncThunk('game/getSchemas', async () => {
	const response = await game.getSchemas();
	console.log(response);
	return response;
});

export const setAccountToken = createAsyncThunk(
	'game/setAccountToken',
	async (_, { getState }) => {
		const { game: gameState } = getState();

		for (let count = 0; count < 3; count++) {
			try {
				await game.setAccountTokens(gameState.removeToken);
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

export const buyCpuNet = createAsyncThunk('game/buyCpuNet', async (data) => {
	for (let count = 0; count < 3; count++) {
		try {
			const response = await game.buyCpuNet(data);
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
});

export const buyRam = createAsyncThunk('game/buyRam', async (data) => {
	for (let count = 0; count < 3; count++) {
		try {
			const response = await game.buyRam(data);
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
});
function filterToken(item) {
	if (item.contract === 'galaxytoken' && item.token.includes('4')) {
		return true;
	}
	return false;
}
function filterOldToken(item) {
	if (item.contract === 'galaxytoken' && item.token.includes('8')) {
		return true;
	}
	return false;
}

export const GameSlicer = createSlice({
	name: 'game',
	initialState: {
		status: 'idle',
		waxAccountInfo: {
			ram_quota: 0,
			net_weight: 0,
			cpu_weight: 0,
			net_limit: {
				used: 0,
				available: 0,
				max: 0,
			},
			cpu_limit: {
				used: 0,
				available: 0,
				max: 0,
			},
			ram_usage: 3164,
			total_resources: {
				owner: '',
				net_weight: '0.00000000 WAX',
				cpu_weight: '0.00000000 WAX',
				ram_bytes: 0,
			},
		},
		selectedMap: 0,
		update: false,
		backgroundStatus: 'idle',
		backgroundUpdateStatus: false,
		isCanceled: false,
		isGameLoaded: false,
		isSetToken: true,
		lackingResource: '',
		removeToken: [],
		lackingValue: '',
		error: '',
		claimAssets: [],
	},
	reducers: {
		setUpdate: (state, action) => {
			state.update = action.payload;
		},
		setBackgroundUpdate: (state, action) => {
			state.backgroundUpdateStatus = action.payload;
		},
		cancelLoading: (state, action) => {
			state.isCanceled = action.payload;
		},
		setTokenModal: (state, action) => {
			state.isSetToken = action.payload;
		},
		setLackResource: (state, action) => {
			state.lackingResource = action.payload;
			state.lackingValue = '';
		},
		setLackingValue: (state, action) => {
			state.lackingValue = action.payload;
		},
		setSelectedMap: (state, action) => {
			state.selectedMap = action.payload;
		},
		setClearAsset: (state) => {
			state.claimAssets = [];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(thunkUpdater.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(thunkUpdater.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.isGameLoaded = 'loaded';
				state.update = false;
			})
			.addCase(thunkUpdater.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(getSchemas.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getSchemas.fulfilled, (state, action) => {
				state.status = 'succeeded';
			})
			.addCase(getSchemas.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})

			.addCase(backgroundUpdate.pending, (state, action) => {
				state.backgroundStatus = 'loading';
			})
			.addCase(backgroundUpdate.fulfilled, (state, action) => {
				state.backgroundStatus = 'succeeded';
				state.backgroundUpdateStatus = false;
			})
			.addCase(backgroundUpdate.rejected, (state, action) => {
				state.backgroundStatus = 'failed';
				state.error = action.error.message;
			})

			.addCase(getWaxAccount.pending, (state, action) => {
				state.status = 'pending';
			})
			.addCase(getWaxAccount.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.waxAccountInfo = action.payload;
			})
			.addCase(getWaxAccount.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})

			.addCase(getAccountToken.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getAccountToken.fulfilled, (state, action) => {
				if (action.payload === true) state.isSetToken = true;
				else {
					const galaxytoken = action.payload.filter(filterToken);
					const oldToken = action.payload.filter(filterOldToken);
					let isSet1 = false;
					let isSet2 = true;
					if (oldToken.length >= 1) {
						let temp = [];
						oldToken.forEach((token) => {
							temp.push(token.key);
						});
						state.removeToken = temp;
						isSet1 = true;
					}
					if (galaxytoken.length === 3) {
						isSet2 = false;
					}
					if (isSet1 || isSet2) {
						state.isSetToken = false;
					} else {
						state.isSetToken = true;
					}
				}
				state.status = 'loaded';
			})
			.addCase(getAccountToken.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(mbsGetUnclaimedAsset.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(mbsGetUnclaimedAsset.fulfilled, (state, action) => {
				let temp = [];
				action.payload.forEach((payload) => {
					temp.push(payload.asset_id);
				});
				state.claimAssets = temp;
			})
			.addCase(mbsGetUnclaimedAsset.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(setAccountToken.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(setAccountToken.fulfilled, (state, action) => {
				state.isSetToken = action.payload;
				state.status = 'loaded';
			})
			.addCase(setAccountToken.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(buyCpuNet.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(buyCpuNet.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(buyCpuNet.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			})
			.addCase(buyRam.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(buyRam.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(buyRam.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
			});
	},
});

export const {
	setUpdate,
	setBackgroundUpdate,
	cancelLoading,
	setTokenModal,
	setLackResource,
	setLackingValue,
	setSelectedMap,
	setClearAsset,
} = GameSlicer.actions;

export default GameSlicer.reducer;

// {
//     "account_name": "z1cwu.wam",
//     "head_block_num": 139482755,
//     "head_block_time": "2021-09-09T12:46:09.000",
//     "privileged": false,
//     "last_code_update": "1970-01-01T00:00:00.000",
//     "created": "2021-08-31T11:29:34.500",
//     "core_liquid_balance": "128.95274731 WAX",
//     "ram_quota": 5495,
//     "net_weight": 10000000,
//     "cpu_weight": "12980000000",
//     "net_limit": {
//         "used": 5416,
//         "available": 17711,
//         "max": 23127
//     },
//     "cpu_limit": {
//         "used": 11014,
//         "available": 5002,
//         "max": 16016
//     },
//     "ram_usage": 4004,
//     "permissions": [
//         {
//             "perm_name": "active",
//             "parent": "owner",
//             "required_auth": {
//                 "threshold": 2,
//                 "keys": [
//                     {
//                         "key": "EOS8VeGD9CiACz88uGXrs1GM1nmMmrDMhh45isMVHWGitb8JCkgTP",
//                         "weight": 1
//                     }
//                 ],
//                 "accounts": [
//                     {
//                         "permission": {
//                             "actor": "managed.wax",
//                             "permission": "cosign"
//                         },
//                         "weight": 1
//                     }
//                 ],
//                 "waits": []
//             }
//         },
//         {
//             "perm_name": "owner",
//             "parent": "",
//             "required_auth": {
//                 "threshold": 1,
//                 "keys": [],
//                 "accounts": [
//                     {
//                         "permission": {
//                             "actor": "managed.wax",
//                             "permission": "active"
//                         },
//                         "weight": 1
//                     }
//                 ],
//                 "waits": []
//             }
//         }
//     ],
//     "total_resources": {
//         "owner": "z1cwu.wam",
//         "net_weight": "0.10000000 WAX",
//         "cpu_weight": "129.80000000 WAX",
//         "ram_bytes": 4095
//     },
//     "self_delegated_bandwidth": {
//         "from": "z1cwu.wam",
//         "to": "z1cwu.wam",
//         "net_weight": "0.10000000 WAX",
//         "cpu_weight": "79.80000000 WAX"
//     },
//     "refund_request": null,
//     "voter_info": {
//         "owner": "z1cwu.wam",
//         "proxy": "",
//         "producers": [],
//         "staked": "7990000000",
//         "unpaid_voteshare": "0.00000000000000000",
//         "unpaid_voteshare_last_updated": "1970-01-01T00:00:00.000",
//         "unpaid_voteshare_change_rate": "0.00000000000000000",
//         "last_claim_time": "1970-01-01T00:00:00.000",
//         "last_vote_weight": "0.00000000000000000",
//         "proxied_vote_weight": "0.00000000000000000",
//         "is_proxy": 0,
//         "flags1": 0,
//         "reserved2": 0,
//         "reserved3": "0 "
//     },
//     "rex_info": null,
//     "subjective_cpu_bill_limit": {
//         "used": 0,
//         "available": 0,
//         "max": 0
//     }
// }
