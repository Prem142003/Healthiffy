import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { paymentApi } from '../../services/paymentApi';

const initialState = {
  settings: null,
  payments: [],
  pagination: null,
  status: 'idle',
  error: null
};

const extractData = (response) => response.data.data;
const extractError = (error) => error.response?.data?.message || 'Something went wrong';

export const fetchPaymentSettings = createAsyncThunk('payments/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    return extractData(await paymentApi.getPublicSettings());
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updatePaymentSettings = createAsyncThunk('payments/updateSettings', async (payload, { rejectWithValue }) => {
  try {
    return extractData(await paymentApi.updateSettings(payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const submitManualPayment = createAsyncThunk('payments/submitManual', async ({ orderId, payload }, { rejectWithValue }) => {
  try {
    return extractData(await paymentApi.submitManualPayment(orderId, payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const fetchPayments = createAsyncThunk('payments/fetchAdmin', async (params, { rejectWithValue }) => {
  try {
    return extractData(await paymentApi.getPayments(params));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const verifyPayment = createAsyncThunk('payments/verify', async (id, { rejectWithValue }) => {
  try {
    return extractData(await paymentApi.verifyPayment(id));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const rejectPayment = createAsyncThunk('payments/reject', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return extractData(await paymentApi.rejectPayment(id, payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

const upsertPayment = (payments, payment) => {
  const index = payments.findIndex((item) => item._id === payment._id);
  if (index === -1) {
    payments.unshift(payment);
    return;
  }
  payments[index] = payment;
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentSettings.fulfilled, (state, action) => {
        state.settings = action.payload.settings;
        state.status = 'succeeded';
      })
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        state.settings = action.payload.settings;
        state.status = 'succeeded';
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
        state.status = 'succeeded';
      })
      .addCase(submitManualPayment.fulfilled, (state, action) => {
        upsertPayment(state.payments, action.payload.payment);
        state.status = 'succeeded';
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        upsertPayment(state.payments, action.payload.payment);
        state.status = 'succeeded';
      })
      .addCase(rejectPayment.fulfilled, (state, action) => {
        upsertPayment(state.payments, action.payload.payment);
        state.status = 'succeeded';
      })
      .addMatcher(
        (action) => action.type.startsWith('payments/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('payments/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  }
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
