import { configureStore } from '@reduxjs/toolkit';
import { weatherApi } from './api/weatherApi';
import citiesSlice from './slices/citiesSlice';

export const store = configureStore({
  reducer: {
    cities: citiesSlice,
    [weatherApi.reducerPath]: weatherApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(weatherApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
