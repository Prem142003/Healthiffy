import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { categoryApi } from '../../services/categoryApi';

const initialState = {
  categories: [],
  pagination: null,
  status: 'idle',
  error: null
};

const extractData = (response) => response.data.data;
const extractError = (error) => error.response?.data?.message || 'Something went wrong';

export const fetchAdminCategories = createAsyncThunk('categories/fetchAdmin', async (params, { rejectWithValue }) => {
  try {
    return extractData(await categoryApi.getAdminCategories(params));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const createCategory = createAsyncThunk('categories/create', async (payload, { rejectWithValue }) => {
  try {
    return extractData(await categoryApi.createCategory(payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateCategory = createAsyncThunk('categories/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return extractData(await categoryApi.updateCategory(id, payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateCategoryStatus = createAsyncThunk('categories/updateStatus', async ({ id, isActive }, { rejectWithValue }) => {
  try {
    return extractData(await categoryApi.updateCategoryStatus(id, isActive));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
  try {
    return extractData(await categoryApi.deleteCategory(id));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

const upsertCategory = (categories, category) => {
  const index = categories.findIndex((item) => item._id === category._id);
  if (index === -1) {
    categories.unshift(category);
    return;
  }
  categories[index] = category;
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload.categories;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        upsertCategory(state.categories, action.payload.category);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        upsertCategory(state.categories, action.payload.category);
      })
      .addCase(updateCategoryStatus.fulfilled, (state, action) => {
        upsertCategory(state.categories, action.payload.category);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        upsertCategory(state.categories, action.payload.category);
      })
      .addMatcher(
        (action) => action.type.startsWith('categories/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  }
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
