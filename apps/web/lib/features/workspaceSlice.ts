import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WorkspaceState {
  workspaces: any[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: null,
  loading: true,
  error: null,
};

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<any[]>) => {
      state.workspaces = action.payload;
      state.loading = false;
      state.error = null;
    },
    setWorkspacesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setWorkspacesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearWorkspaces: (state) => {
      state.workspaces = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setWorkspaces, setWorkspacesLoading, setWorkspacesError, clearWorkspaces } = workspaceSlice.actions;
export default workspaceSlice.reducer;
