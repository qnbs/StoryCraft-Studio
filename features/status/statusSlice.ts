import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SavingStatus = 'idle' | 'saving' | 'saved';

export interface StatusState {
    saving: SavingStatus;
}

const initialState: StatusState = {
    saving: 'idle',
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setSavingStatus(state, action: PayloadAction<SavingStatus>) {
        state.saving = action.payload;
    },
  },
});

export const statusActions = statusSlice.actions;
export default statusSlice.reducer;