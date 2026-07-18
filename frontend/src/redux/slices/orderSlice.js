import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { orderApi } from '../../services/orderApi';

const initialState = {
  orders: [],
  pagination: null,
  status: 'idle',
  error: null
};

const extractData = (response) => response.data.data;
const extractError = (error) => error.response?.data?.message || 'Something went wrong';

export const createOrder = createAsyncThunk('orders/create', async (payload, { rejectWithValue }) => {
  try {
    return extractData(await orderApi.createOrder(payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (params, { rejectWithValue }) => {
  try {
    return extractData(await orderApi.getMyOrders(params));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const fetchAdminOrders = createAsyncThunk('orders/fetchAdmin', async (params, { rejectWithValue }) => {
  try {
    return extractData(await orderApi.getAdminOrders(params));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return extractData(await orderApi.updateOrderStatus(id, payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return extractData(await orderApi.cancelOrder(id, payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

const upsertOrder = (orders, order) => {
  const index = orders.findIndex((item) => item._id === order._id);
  if (index === -1) {
    orders.unshift(order);
    return;
  }
  orders[index] = order;
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        upsertOrder(state.orders, action.payload.order);
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        upsertOrder(state.orders, action.payload.order);
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        upsertOrder(state.orders, action.payload.order);
      })
      .addMatcher(
        (action) => action.type.startsWith('orders/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  }
});

export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
