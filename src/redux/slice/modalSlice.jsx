import { createSlice } from '@reduxjs/toolkit'


export const modalSlicer = createSlice({
    name: 'modal',
    initialState: {
        isShowing: false,
        error: '',
        isLoading: false,

    },
    reducers: {
        toggleModal: (state, action) => {
            state.isShowing = action.payload;
        },
        setErrorMessage: (state, action) => {
            state.error = action.payload
        },
        setLoadingModal: (state, action) => {
            state.isLoading = action.payload
        }
    }
}
)

export const { toggleModal, setErrorMessage, setLoadingModal } = modalSlicer.actions

export default modalSlicer.reducer