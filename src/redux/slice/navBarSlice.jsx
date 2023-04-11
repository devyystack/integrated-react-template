/** @format */

import { createSlice } from "@reduxjs/toolkit";

import home from '../../static/media/Home.png';
import chest from '../../static/media/Chest.png';
import smithy from '../../static/media/Smithy.png';
import exchange from '../../static/media/Exchange.png';

export const NavBarSlice = createSlice({
	name: "navBar",
	initialState: {
		tabs: [
			{
				name: "Home",
				icon: home,
			},
			{
				name: "Inventory",
				icon: chest,
			},
			{
				name: "Store",
				icon: smithy,
			},
			{
				name: "Exchange",
				icon: exchange,
			},
			// updated by
			// {
			// 	name: "Map",
			// 	icon: "/Map.png",
			// },
			// {
			// 	name: "Market",
			// 	icon: "/Market.png",
			// },
			// {
			// 	name: "Atomic",
			// 	icon: atomic,
			// },
		],
		selectedTab: 0,
	},
	reducers: {
		ChooseTab: (state, action) => {
			state.selectedTab = action.payload;
		},
	},
});

export const { ChooseTab } = NavBarSlice.actions;

export default NavBarSlice.reducer;
