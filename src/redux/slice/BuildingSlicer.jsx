/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { game } from './authSlicer';
import { isRepeatable, sleep, timeout } from '../../utils';
import { MAIN_SERVERURL, lockFeature, ticketTemplate } from '../../config';
import { getChestAssetsByTemplate } from './AtomicSlicer';
const mapMintResources = {
	PLASMA: 'plasma_mint',
	OXYGEN: 'oxygen_mint',
	ASTEROID: 'asteroid_mint',
};

const ticketTemplateMapping = {
	5: ticketTemplate.main[0],
	10: ticketTemplate.main[1],
	15: ticketTemplate.main[2],
};

export const getBuildingTransaction = createAsyncThunk(
	'builds/getBuildingTransaction',
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
						if (response.actions[index].act.name === 'logmintasset') {
							claim = response.actions[index].act?.data.data;
							result = { claim: claim };
							if (claim.discount) flag = true;
						}
					}
				}
				if (flag !== false) return result;
			} catch (error) {
				SERVER_URL.splice(count % SERVER_URL.length, 1);
				count--;
				if (SERVER_URL.length === 0) throw new Error(`Craft successfully!`);
				continue;
			}
		}
		throw new Error(`Craft successfully!`);
	}
);

export const claimBuilding = createAsyncThunk(
	'builds/claimBuilding',
	async (asset_id) => {
		for (let count = 0; count < 3; count++) {
			try {
				const response = await game.claimBuilding(asset_id);
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
			const { builds } = getState();
			const fetchStatus = builds.requests.filter(
				(__asset_id) => __asset_id === asset_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);
export const craftBuilding = createAsyncThunk(
	'builds/craftBuilding',
	async (data, { getState, rejectWithValue }) => {
		const { auth } = getState();
		let isVerify = auth.authSettings.features & lockFeature[2].value;
		const isUnlocked2FA = auth.isUnlocked2FA;
		if (isVerify) {
			if (!isUnlocked2FA)
				return rejectWithValue('You have to Unlock 2FA to use this Feature!');
		}

		const { ticket, template_id } = data;
		let ticket_ids = [];
		if (ticket !== 0) {
			const { atomic } = getState();
			[...ticket_ids] = getChestAssetsByTemplate(
				atomic.tickets,
				ticketTemplateMapping[ticket]
			);
		}
		for (let count = 0; count < 3; count++) {
			try {
				const response = await game.authRequiredTransaction(
					game.verify2fa(isVerify),
					game.craftBuilding(template_id, ticket_ids.pop() || 0)
				);
				return response;
			} catch (error) {
				if (isRepeatable(error.message) && count < 2) continue;

				throw error;
			}
		}
	},
	{
		condition: (data, { getState, extra }) => {
			const { template_id } = data;
			const { builds } = getState();
			const fetchStatus = builds.requests.filter(
				(__template_id) => __template_id === template_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const getBuildingConfig = createAsyncThunk(
	'builds/getBuildingConfig',
	async () => {
		const response = await game.getBuildingConfig();
		return response;
	}
);

export const getUsingBuilding = createAsyncThunk(
	'builds/getUsingBuilding',
	async () => {
		const response = await game.getUsingBuilding();
		return response;
	}
);

// Building section
export const buildingSlicer = createSlice({
	name: 'builds',
	initialState: {
		usingBuilds: [{}, {}, {}, {}],
		buildConfig: [],
		mapConfig: [1, 0, 0, 0],
		requests: [],
		status: 'idle',
		error: '',
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getUsingBuilding.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getUsingBuilding.fulfilled, (state, action) => {
				state.status = 'loaded';
				let tempUsingBuilds = [];
				for (let conf in state.buildConfig) {
					const temp = action.payload.find(
						(build) => build.template_id === state.buildConfig[conf].template_id
					);
					tempUsingBuilds.push(Object.assign(state.buildConfig[conf], temp));
				}

				// state.usingBuilds = tempUsingBuilds;

				let tempOrder = [{}, {}, {}, {}];
				tempUsingBuilds.forEach((build) => {
					if (build.name === 'Cowshed') {
						tempOrder[3] = build;
					} else if (build.name === 'Coop') {
						tempOrder[1] = build;
					} else if (build.name === 'Farm Plot') {
						tempOrder[2] = build;
					}
				});
				state.usingBuilds = tempOrder;
			})
			.addCase(getUsingBuilding.rejected, (state, action) => {
				state.status = 'rejected';
				state.error = action.error.message;
			})
			.addCase(getBuildingConfig.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getBuildingConfig.fulfilled, (state, action) => {
				state.status = 'loaded';
				state.buildConfig = action.payload;

				for (let item in state.buildConfig) {
					state.buildConfig[item].charged_time =
						state.buildConfig[item].charge_time;
					delete state.buildConfig[item].charge_time;
					for (let mintIndex in state.buildConfig[item].craft_cost) {
						const parsed =
							state.buildConfig[item].craft_cost[mintIndex].split(' ');
						state.buildConfig[item][mapMintResources[parsed[1]]] = parseInt(
							parsed[0]
						);
					}
				}
			})
			.addCase(getBuildingConfig.rejected, (state, action) => {
				state.status = 'rejected';
				state.error = action.error.message;
			})

			.addCase(claimBuilding.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(claimBuilding.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(claimBuilding.rejected, (state, action) => {
				state.status = 'rejected';
				state.error = action.error.message;
			})
			.addCase(craftBuilding.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(craftBuilding.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(craftBuilding.rejected, (state, action) => {
				state.status = 'rejected';
				state.error = action.error.message;
			})
			.addCase(getBuildingTransaction.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getBuildingTransaction.fulfilled, (state, action) => {
				state.status = 'loaded';
			})
			.addCase(getBuildingTransaction.rejected, (state, action) => {
				state.status = 'rejected';
				state.error = action.error.message;
			});
	},
});
// export const { reOrderCard } = buildingSlicer.actions;

export default buildingSlicer.reducer;
