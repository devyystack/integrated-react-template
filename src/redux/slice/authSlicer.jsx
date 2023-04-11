/** @format */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import GalaxyMiners from '../../api/galaxyminers';
import { raceAll } from '../../utils/index';
import jwt_decode from 'jwt-decode';
import { isRepeatable } from '../../utils';

const SERVERS_URL = [
	// 'https://testnet.waxsweden.org', // testnet
	'https://api.wax.alohaeos.com',
	'https://api.waxsweden.org',
	'https://wax.greymass.com',
	'https://api.wax.greeneosio.com',
	'https://wax.pink.gg',
	'https://wax.dapplica.io',
	'https://wax.cryptolions.io',
	'https://wax.eosphere.io',
	// 'https://wax.hivebp.io',
	// 'https://eos.hyperion.eosrio.io',
	// 'https://waxapi.ledgerwise.io',
	// 'https://api.wax.liquidstudios.io',
	// 'https://apiwax.3dkrender.com',
	// 'https://wax.blokcrafters.io',
	// 'https://wax.eu.eosamsterdam.net',
];
// "https://testnet.wax.pink.gg",
const game = new GalaxyMiners(
	'https://api.wax.alohaeos.com',	'galaxyminers',	'galaxytokens', null // mainnet
	// 'https://testnet.waxsweden.org', 'softgiant123', 'galaxytokens', null // testnet
		// {
		// 	username: 'galaxyminer1',
		// 	privateKey: '5JMyzuirH54Brj8crAduHsPkLvRK7JSP78pHT6391b8CfK7bzJ6',
		// }
		// {
		// 	username: 'softgiant123',
		// 	privateKey: '5JAZTL63Jmv2xqBYndC4aNto6FHZgDVjBMuiG5FpFt9pGPERKnz',
		// }
);

export const login2FA = createAsyncThunk('auth/login2FA', async () => {
	const nonce = await game.getNonce();
	const { serializedTransaction, signatures, transaction } =
		await game.getProof(nonce);
	const proof = {
		serializedTransaction: serializedTransaction,
		signatures: signatures,
		transaction: transaction,
	};
	const response = await game.login2FA(proof, nonce);
	return response;
});

export const verifyOtp = createAsyncThunk(
	'auth/verifyOtp',
	async (otpCode, { getState }) => {
		const response = await game.verifyOtp(otpCode);
		if (response.flag === 2) {
			await game.verifyOtp();
		}
		return response;
		// const
	}
);
export const enable2FA = createAsyncThunk('auth/enable2FA', async () => {
	const response = await game.enable2FA();
	return response;
});

export const disable2FA = createAsyncThunk('auth/disable2FA', async () => {
	const response = await game.disable2FA();
	return response;
});

export const setAuthSettings = createAsyncThunk(
	'auth/setAuthSettings',
	async (data, { getState, dispatch }) => {
		const { auth } = getState();
		let flag = !!auth.authSettings.features;
		for (let index = 0; index < 3; index++) {
			try {
				const response = await game.authRequiredTransaction(
					game.verify2fa(flag),
					game.setAuthSettings(data)
				);
				if (
					!auth.authSettings.locked &&
					(!!response.transaction_id ||
						!!response.processed ||
						!!response.transaction) &&
					flag
				) {
					await game.lock2FA();
				}
				await game.update2FADuration(data.unlock_duration);

				response.unlockDuration = data.unlock_duration;
				await dispatch(getAuthSettings()).unwrap();
				return response;
			} catch (error) {
				let temp = JSON.stringify(error);
				if (temp.includes('Error expected key')) {
					await game.lock2FA();
				}
				if (isRepeatable(error.message) && index < 2) continue;
				throw error;
			}
		}
	}
);

export const removeAuthSettings = createAsyncThunk(
	'auth/removeAuthSettings',
	async (_, { dispatch }) => {
		for (let index = 0; index < 3; index++) {
			try {
				const response = await game.authRequiredTransaction(
					game.verify2fa(true),
					game.removeAuthSettings()
				);
				console.log(response);
				if (
					!!response.transaction_id ||
					!!response.processed ||
					!!response.transaction
				)
					await dispatch(disable2FA()).unwrap();
				return response;
			} catch (error) {
				if (isRepeatable(error) && index < 2) continue;
				throw error;
			}
		}
	}
);

export const getAuthStatus = createAsyncThunk(
	'auth/getAuthStatus',
	async (_, { getState }) => {
		const { user } = getState();
		const response = await game.getAuthStatus();
		response.name = user.info.account;
		return response;
	}
);

export const checkServersHealth = createAsyncThunk(
	'auth/checkServersHealth',
	async (_, { rejectWithValue }) => {
		for (let index = 0; index < 3; index++) {
			try {
				const results = await raceAll(
					SERVERS_URL.map(async (link) => {
						try {
							const result = await axios.post(
								link + '/v1/chain/get_table_rows',
								{
									json: true,
									code: 'galaxyminers',   // mainnet
									scope: 'galaxyminers',  // mainnet
									// code: 'softgiant123',     // testnet
									// scope: 'softgiant123',    // testnet
									table: 'setting',
									limit: '1',
								}
							);
							return { response: result, server: link };
						} catch (error) {
							return { response: false, server: link };
						}
					}),
					10000,
					null
				);
				let final = results.filter((item) => !!item.response);
				if (final.length > 0) return final;
				if (index === 2 && final.length < 1)
					rejectWithValue('Failed to connect to server');
			} catch (err_1) {
				console.log('checkServersHealth', err_1);
			}
		}
		rejectWithValue('Failed to connect to server');
	}
);

export const getAuthSettings = createAsyncThunk(
	'auth/getAuthSettings',
	async () => {
		for (let index = 0; index < 3; index++) {
			try {
				const response = await game.getAuthSettings();
				return response;
			} catch (error) {
				if (isRepeatable(error.message) && index < 2) continue;
				throw error;
			}
		}
	}
);

export const login = createAsyncThunk('auth/login', async () => {
	const name = await game.login();
	// console.log("login", name)
	return name;
});

export const register = createAsyncThunk('auth/register', async () => {
	const referral = localStorage.getItem('referral');
	try {
		const response = await game.register(referral, "active");
		return response;
	} catch(error) {
		const response = await game.register(referral, "owner");
		return response;
	}
});

// export const register = createAsyncThunk('auth/register', async () => {
// 	const referral = localStorage.getItem('referral');
// 	const response = await game.register(referral);
// 	return response;
// });

export const waxLogin = createAsyncThunk('auth/waxLogin', async () => {
	const response = await game.login();
	console.log('login response', response);
	return response;
});

export const anchorLogin = createAsyncThunk('auth/anchorLogin', async () => {
	const response = await game.anchorLogin();
	console.log('anchor login response', response);
	return response;
});
export { game };
// https://testnet.waxsweden.org
// https://wax.greymass.com
export const AuthSlicer = createSlice({
	name: 'auth',
	initialState: {
		user: {
			server: 
			'https://wax.greymass.com', // mainnet
			// "https://testnet.waxsweden.org", // testnet
			accountCollection: 'galaxyminers',
			mintCollection: 'galaxytokens',
			account: {
				name: '',
				key: '',
			},
		},
		// isLoggedIn: true,
		// isRegisteredStatus: true,
		isLoggedIn: false,
		isRegisteredStatus: false,
		splash: false,
		authSettings: {
			account: '',
			features: 0,
			pubkey: '',
			unlockDuration: 0,
		},
		authFlag: null,
		timestamp: null,
		isLogin2FA: null,
		isSCReistered2FA: null,
		isUnlocked2FA: null,
		error: null,
		servers: [],
		selectedServer: '',
		status: '',
	},
	reducers: {
		submitUser: (state, action) => {
			state.user.account.name = action.payload.account;
			state.user.account.key = action.payload.key;
			const username = state.user.account.name;
			const privateKey = state.user.account.key;
			game.setPrivateAccount({ username, privateKey });
			state.isLoggedIn = true;
		},
		setServer: (state, action) => {
			state.selectedServer = state.servers[action.payload];
			game.setServer(state.selectedServer);
		},

		setRegisterStatus: (state, action) => {
			state.isRegisteredStatus = action.payload;
		},
		setSplashScreen: (state, action) => {
			state.splash = action.payload;
		},
		setLoginStatus: (state, action) => {
			state.isLoggedIn = action.payload;
		},
		setUnlock2FA: (state, action) => {
			state.isUnlocked2FA = action.payload;
		},
		setLogin2FA: (state, action) => {
			state.isLogin2FA = action.payload;
		},
		resetSignature: (state, action) => {
			game.clearSig();
			state.timestamp = null;
			state.isUnlocked2FA = null;
		},
		isValidbackupKey: (state, action) => {
			try {
				let flag = game.isValidbackupKey(action.payload);
				if (flag) {
					state.isUnlocked2FA = true;
				}
			} catch (error) {
				throw error;
			}
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(login.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.isLoggedIn = true;
				state.user.name = action.payload;
			})
			.addCase(login.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(anchorLogin.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(anchorLogin.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.isLoggedIn = true;
				state.user.name = action.payload.actor;
			})
			.addCase(anchorLogin.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(register.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(register.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.isRegisteredStatus = true;
			})
			.addCase(register.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(waxLogin.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(waxLogin.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.isLoggedIn = true;
				state.user.name = action.payload;
			})
			.addCase(waxLogin.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(checkServersHealth.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(checkServersHealth.fulfilled, (state, action) => {
				state.status = 'succeeded';
				console.log(action)
				action.payload.forEach((data) => {
					// const isOkay = data.response.data?.health[1].status === "OK"
					// if (isOkay) {
					state.servers.push(data.server);
					// }
				});
				state.selectedServer = state.servers[0];
				game.setServer(state.servers[0]);
			})
			.addCase(checkServersHealth.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(getAuthSettings.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getAuthSettings.fulfilled, (state, action) => {
				state.status = 'succeeded';

				if (action.payload.length > 0) {
					state.authSettings.account = action.payload[0].account;
					state.authSettings.pubkey = action.payload[0].pubkey;
					state.authSettings.features = action.payload[0].features;
					state.isSCReistered2FA = true;
					state.authFlag = false;
				} else {
					state.isSCReistered2FA = false;
					state.authFlag = true;
				}
			})
			.addCase(getAuthSettings.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(login2FA.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(login2FA.fulfilled, (state, action) => {
				state.status = 'succeeded';
				if (action.payload.token) {
					const decoded = jwt_decode(action.payload.token);
					localStorage.setItem(
						`s.id ${decoded.waxAddress}`,
						action.payload.token
					);
				}
			})
			.addCase(login2FA.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(verifyOtp.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(verifyOtp.fulfilled, (state, action) => {
				state.status = 'succeeded';
				if (action.payload.ok) {
					if (action.payload.flag === 2)
						state.timestamp = action.payload.timestamp;
					state.isUnlocked2FA = true;
				} else {
					state.isUnlocked2FA = false;
				}
			})
			.addCase(verifyOtp.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(enable2FA.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(enable2FA.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.authSettings.otpSecret = action.payload.otpSecret;
				state.authSettings.publicKey = action.payload.publicKey;
				state.authSettings.privateKey = action.payload.privateKey;
				state.authSettings.name = action.payload.name;
			})
			.addCase(enable2FA.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(disable2FA.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(disable2FA.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.isUnlocked2FA = false;
				state.isSCReistered2FA = false;
				state.authSettings = {
					account: '',
					features: 0,
					pubkey: '',
					unlockDuration: 0,
				};
			})
			.addCase(disable2FA.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(setAuthSettings.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(setAuthSettings.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.authSettings.unlockDuration = action.payload.unlockDuration;
			})
			.addCase(setAuthSettings.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(removeAuthSettings.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(removeAuthSettings.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.authSettings = {
					account: '',
					features: 0,
					pubkey: '',
					unlockDuration: 0,
				};
				state.isUnlocked2FA = false;
				state.isSCReistered2FA = false;
			})
			.addCase(removeAuthSettings.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			})
			.addCase(getAuthStatus.pending, (state, action) => {
				state.status = 'loading';
			})
			.addCase(getAuthStatus.fulfilled, (state, action) => {
				state.status = 'succeeded';
				if (action.payload.enabled) {
					if (!action.payload.locked) {
						state.authSettings.otpSecret = action.payload.otpSecret;
						state.authSettings.pubkey = action.payload.publicKey;
						state.authSettings.privateKey = action.payload.privateKey;
					} else {
						state.authSettings.pubkey = action.payload.publicKey;
						state.authSettings.unlockDuration = action.payload.unlockDuration;
						state.authSettings.locked = action.payload.locked;
						state.authSettings.enabled = action.payload.enabled;
					}
				}
			})
			.addCase(getAuthStatus.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.error.message;
				// console.log(action.error.message)
			});
	},
});

export const {
	submitUser,
	setRegisterStatus,
	setSplashScreen,
	setLoginStatus,
	setServer,
	setUnlock2FA,
	setLogin2FA,
	resetSignature,
	isValidbackupKey,
} = AuthSlicer.actions;

export default AuthSlicer.reducer;
