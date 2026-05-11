import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.get();
    return data;
  } catch (error) {
    return rejectWithValue('Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.add(productId, quantity);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.update(itemId, quantity);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || 'Failed to update cart');
  }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.remove(itemId);
    return data;
  } catch (error) {
    return rejectWithValue('Failed to remove item');
  }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartAPI.clear();
    return data;
  } catch (error) {
    return rejectWithValue('Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalPrice: 0,
    totalItems: 0,
    loading: false,
    error: null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    const handleCartSuccess = (state, action) => {
      state.loading = false;
      state.items = action.payload.items || [];
      state.totalPrice = action.payload.total_price || 0;
      state.totalItems = action.payload.total_items || 0;
    };

    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, handleCartSuccess)
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })
      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, handleCartSuccess)
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateCartItem.fulfilled, handleCartSuccess)
      .addCase(removeCartItem.fulfilled, handleCartSuccess)
      .addCase(clearCart.fulfilled, handleCartSuccess);
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
