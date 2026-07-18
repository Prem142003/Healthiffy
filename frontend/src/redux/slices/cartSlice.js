import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cartApi } from '../../services/cartApi';

const initialState = {
  cart: null,
  status: 'idle',
  error: null,
  lastOrder: null
};

const extractData = (response) => response.data.data;
const extractError = (error) => error.response?.data?.message || 'Something went wrong';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    return extractData(await cartApi.getCart());
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const addCartItem = createAsyncThunk('cart/addItem', async (payload, { rejectWithValue }) => {
  try {
    return extractData(await cartApi.addItem(payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ menuItemId, quantity }, { rejectWithValue }) => {
  try {
    return extractData(await cartApi.updateItem(menuItemId, { quantity }));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const removeCartItem = createAsyncThunk('cart/removeItem', async (menuItemId, { rejectWithValue }) => {
  try {
    return extractData(await cartApi.removeItem(menuItemId));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    return extractData(await cartApi.clearCart());
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

export const checkoutCart = createAsyncThunk('cart/checkout', async (payload, { rejectWithValue }) => {
  try {
    return extractData(await cartApi.checkout(payload));
  } catch (error) {
    return rejectWithValue(extractError(error));
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    clearLastOrder: (state) => {
      state.lastOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cart = action.payload.cart;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.cart = action.payload.cart;
        state.status = 'succeeded';
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload.cart;
        state.status = 'succeeded';
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload.cart;
        state.status = 'succeeded';
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload.cart;
        state.status = 'succeeded';
      })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        state.cart = action.payload.cart;
        state.lastOrder = action.payload.order;
        state.status = 'succeeded';
      })
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  }
});

export const { clearCartError, clearLastOrder } = cartSlice.actions;
export default cartSlice.reducer;
