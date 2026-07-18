import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { analyticsApi } from '../../services/analyticsApi';

const initialState = {
  summary: null,
  revenue: [],
  branchRevenue: [],
  bestSellingItems: [],
  status: 'idle',
  error: null
};

const extractData = (response) => response.data.data;
const extractError = (error) => error.response?.data?.message || 'Something went wrong';

export const fetchDashboardAnalytics = createAsyncThunk('analytics/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const [summary, revenue, branchRevenue, bestSellingItems] = await Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getRevenue(),
      analyticsApi.getBranchRevenue(),
      analyticsApi.getBestSellingItems()
    ]);

    return {
      summary: extractData(summary).summary,
      revenue: extractData(revenue).revenue,
      branchRevenue: extractData(branchRevenue).branches,
      bestSellingItems: extractData(bestSellingItems).items
    };
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload.summary;
        state.revenue = action.payload.revenue;
        state.branchRevenue = action.payload.branchRevenue;
        state.bestSellingItems = action.payload.bestSellingItems;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default analyticsSlice.reducer;
