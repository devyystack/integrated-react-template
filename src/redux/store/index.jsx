/** @format */

import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import navBarReducer from "../slice/navBarSlice";
import modalReducer from "../slice/modalSlice";
import ToolsReducer from "../slice/ToolsSlicer";
import AuthReducer from "../slice/authSlicer";
import UserReducer from "../slice/userSlicer";
import GameReducer from "../slice/GameSlicer";
import ExchangeReducer from "../../tabs/exchange/exchangeSlice";
import FlashReducer from "../slice/FlashSlicer";
import BadgeReducer from "../slice/BadgeSlicer";
import BuildingReducer from "../slice/BuildingSlicer";
import AnimalsReducer from "../slice/AnimalsSlicer";
import MarketReducer from "../slice/MarketSlicer";
import PlantsReducer from "../slice/PlantsSlicer";
import CoinReducer from "../slice/CoinSlicer";
import OxygensReducer from "../slice/OxygensSlicer";
import PacksReducer from "../slice/PackSlicer";
import BreedingReducer from "../slice/BreedingSlicer";
import AtomicReducer from "../slice/AtomicSlicer";
export default configureStore({
	reducer: {
		flash: FlashReducer,
		navBar: navBarReducer,
		modal: modalReducer,
		tools: ToolsReducer,
		auth: AuthReducer,
		user: UserReducer,
		game: GameReducer,
		badge: BadgeReducer,
		exchange: ExchangeReducer,
		builds: BuildingReducer,
		animals: AnimalsReducer,
		market: MarketReducer,
		plants: PlantsReducer,
		coin: CoinReducer,
		oxygens: OxygensReducer,
		packs: PacksReducer,
		breeding: BreedingReducer,
		atomic: AtomicReducer,
	},
	middleware: getDefaultMiddleware({
		serializableCheck: false,
	}),
});
