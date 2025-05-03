import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../features/api/apiSlice';
import authReducer from '../features/auth/authSlice';
import CustomizationReducer from "../features/CustomizationSlice"

import '../features/api/user.api';
import '../features/api/cart.api';
import '../features/api/measurement.api';
import '../features/api/product.api';
import '../features/api/review.api';
import '../features/api/tailor.api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customization:CustomizationReducer ,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
