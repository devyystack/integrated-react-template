/** @format */

import { createSlice } from '@reduxjs/toolkit';

export const FlashSlicer = createSlice({
	name: 'flash',
	initialState: {
		flashes: [],
	},
	reducers: {
		setFlash: (state, action) => {
			state.flashes.push(action.payload);
		},
		deleteFlash: (state, action) => {
			for (let i = 0; i < state.flashes.length; i++) {
				if (state.flashes[i].id === action.payload) {
					state.flashes.splice(i, 1);
				}
			}
		},
	},
});

export const { deleteFlash, setFlash } = FlashSlicer.actions;

export default FlashSlicer.reducer;
