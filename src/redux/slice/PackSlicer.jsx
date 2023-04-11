/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { game } from "./authSlicer";

export const openPack = createAsyncThunk(
	"pack/openPack",
	async (data) => {
		for (let count = 0; count < 3; count++) {
			try {
				const response = await game.openPack(data.item_id, data.name);
				return response;
			} catch (error) {
				if (
					(error?.message?.includes("undefined") ||
						error?.message?.includes("Failed to fetch")) &&
					count < 2
				)
					continue;
				throw error;
			}
		}
	},
	{
		condition: (item_id, { getState, extra }) => {
			const { packs } = getState();
			const fetchStatus = packs.requests.filter(
				(__item_id) => __item_id === item_id
			);
			if (fetchStatus.length !== 0) {
				return false;
			}
		},
	}
);

export const PackSlice = createSlice({
	name: "packs",
	initialState: {
		status: "idle",
		receivedOpenedPack: "",
		requests: [],
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(openPack.pending, (state, action) => {
				state.status = "loading";
				state.requests.push(action.meta.arg);
			})
			.addCase(openPack.fulfilled, (state, action) => {
				state.status = "loaded";

				action.payload?.processed?.action_traces?.forEach((action) => {
					action.inline_traces.forEach((inline_trace) => {
						state.receivedOpenedPack =
							inline_trace.act.data?.points?.join(" and ");
					});
				});
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			})
			.addCase(openPack.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
				const index = state.requests.indexOf(action.meta.arg);
				state.requests.splice(index, 1);
			});
	},
});
// export const {} = PackSlice.actions;

export default PackSlice.reducer;
