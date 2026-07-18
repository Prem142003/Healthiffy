import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { userApi } from '../../services/userApi';

const initialState = {
  users: [],
  workers: [],
  status: 'idle',
  error: null
};

const extractData = (response) => response.data.data;
const extractError = (error) => error.response?.data?.message || 'Something went wrong';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    return extractData(await userApi.getUsers(params));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const fetchWorkers = createAsyncThunk('users/fetchWorkers', async (params, { rejectWithValue }) => {
  try {
    return extractData(await userApi.getWorkers(params));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const createWorker = createAsyncThunk('users/createWorker', async (payload, { rejectWithValue }) => {
  try {
    return extractData(await userApi.createWorker(payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateUser = createAsyncThunk('users/updateUser', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return extractData(await userApi.updateUser(id, payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

const upsert = (items, user) => {
  const index = items.findIndex((item) => item._id === user._id);
  if (index === -1) items.unshift(user);
  else items[index] = user;
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.status = 'succeeded';
      })
      .addCase(fetchWorkers.fulfilled, (state, action) => {
        state.workers = action.payload.users;
        state.status = 'succeeded';
      })
      .addCase(createWorker.fulfilled, (state, action) => {
        upsert(state.workers, action.payload.user);
        upsert(state.users, action.payload.user);
        state.status = 'succeeded';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        upsert(state.users, action.payload.user);
        if (action.payload.user.role === 'WORKER') upsert(state.workers, action.payload.user);
        state.status = 'succeeded';
      })
      .addMatcher(
        (action) => action.type.startsWith('users/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('users/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  }
});

export default userSlice.reducer;
