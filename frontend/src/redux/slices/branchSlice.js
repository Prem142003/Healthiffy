import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { branchApi } from '../../services/branchApi';

const initialState = {
  branches: [],
  pagination: null,
  status: 'idle',
  error: null,
  customerBranches: [],
  customerStatus: 'idle',
  customerError: null,
  selectedCustomerBranchId: ''
};

const extractData = (response) => response.data.data;
const extractError = (error) => error.response?.data?.message || 'Something went wrong';

export const fetchAdminBranches = createAsyncThunk('branches/fetchAdmin', async (params, { rejectWithValue }) => {
  try {
    return extractData(await branchApi.getAdminBranches(params));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const fetchPublicBranches = createAsyncThunk('branches/fetchPublic', async (_, { rejectWithValue }) => {
  try {
    return extractData(await branchApi.getPublicBranches({ limit: 100, sort: 'name' }));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const createBranch = createAsyncThunk('branches/create', async (payload, { rejectWithValue }) => {
  try {
    return extractData(await branchApi.createBranch(payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateBranch = createAsyncThunk('branches/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return extractData(await branchApi.updateBranch(id, payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateBranchStatus = createAsyncThunk('branches/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    return extractData(await branchApi.updateBranchStatus(id, status));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const deleteBranch = createAsyncThunk('branches/delete', async (id, { rejectWithValue }) => {
  try {
    return extractData(await branchApi.deleteBranch(id));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

const upsertBranch = (branches, branch) => {
  const index = branches.findIndex((item) => item._id === branch._id);
  if (index === -1) {
    branches.unshift(branch);
    return;
  }
  branches[index] = branch;
};

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    clearBranchError: (state) => {
      state.error = null;
    },
    selectCustomerBranch: (state, action) => {
      if (state.customerBranches.some((branch) => branch._id === action.payload)) {
        state.selectedCustomerBranchId = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminBranches.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminBranches.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.branches = action.payload.branches;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminBranches.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchPublicBranches.pending, (state) => {
        state.customerStatus = 'loading';
        state.customerError = null;
      })
      .addCase(fetchPublicBranches.fulfilled, (state, action) => {
        const branches = action.payload.branches || [];
        state.customerStatus = 'succeeded';
        state.customerBranches = branches;
        if (!branches.some((branch) => branch._id === state.selectedCustomerBranchId)) {
          state.selectedCustomerBranchId = branches[0]?._id || '';
        }
      })
      .addCase(fetchPublicBranches.rejected, (state, action) => {
        state.customerStatus = 'failed';
        state.customerError = action.payload;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        upsertBranch(state.branches, action.payload.branch);
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        upsertBranch(state.branches, action.payload.branch);
      })
      .addCase(updateBranchStatus.fulfilled, (state, action) => {
        upsertBranch(state.branches, action.payload.branch);
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        upsertBranch(state.branches, action.payload.branch);
      })
      .addMatcher(
        (action) => action.type.startsWith('branches/')
          && action.type.endsWith('/rejected')
          && action.type !== fetchPublicBranches.rejected.type,
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  }
});

export const { clearBranchError, selectCustomerBranch } = branchSlice.actions;
export default branchSlice.reducer;
