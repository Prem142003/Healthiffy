import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { menuItemApi } from '../../services/menuItemApi';

const initialState = {
  menuItems: [],
  pagination: null,
  status: 'idle',
  error: null
};

const extractData = (response) => response.data.data;
const extractError = (error) => error.response?.data?.message || 'Something went wrong';

export const fetchAdminMenuItems = createAsyncThunk('menuItems/fetchAdmin', async (params, { rejectWithValue }) => {
  try {
    return extractData(await menuItemApi.getAdminMenuItems(params));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const createMenuItem = createAsyncThunk('menuItems/create', async (payload, { rejectWithValue }) => {
  try {
    return extractData(await menuItemApi.createMenuItem(payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateMenuItem = createAsyncThunk('menuItems/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return extractData(await menuItemApi.updateMenuItem(id, payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateMenuItemAvailability = createAsyncThunk('menuItems/updateAvailability', async ({ id, isAvailable }, { rejectWithValue }) => {
  try {
    return extractData(await menuItemApi.updateMenuItemAvailability(id, isAvailable));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const deleteMenuItem = createAsyncThunk('menuItems/delete', async (id, { rejectWithValue }) => {
  try {
    return extractData(await menuItemApi.deleteMenuItem(id));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

const upsertMenuItem = (menuItems, menuItem) => {
  const index = menuItems.findIndex((item) => item._id === menuItem._id);
  if (index === -1) {
    menuItems.unshift(menuItem);
    return;
  }
  menuItems[index] = menuItem;
};

const menuItemSlice = createSlice({
  name: 'menuItems',
  initialState,
  reducers: {
    clearMenuItemError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminMenuItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminMenuItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.menuItems = action.payload.menuItems;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminMenuItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        upsertMenuItem(state.menuItems, action.payload.menuItem);
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        upsertMenuItem(state.menuItems, action.payload.menuItem);
      })
      .addCase(updateMenuItemAvailability.fulfilled, (state, action) => {
        upsertMenuItem(state.menuItems, action.payload.menuItem);
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        upsertMenuItem(state.menuItems, action.payload.menuItem);
      })
      .addMatcher(
        (action) => action.type.startsWith('menuItems/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  }
});

export const { clearMenuItemError } = menuItemSlice.actions;
export default menuItemSlice.reducer;
