import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import citiesSlice from '@/app/store/slices/citiesSlice';

// Create a custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        cities: citiesSlice,
        weatherApi: () => ({}),
      },
      preloadedState,
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    }),
    theme = createTheme(),
    ...renderOptions
  }: {
    preloadedState?: Record<string, unknown>;
    store?: ReturnType<typeof configureStore>;
    theme?: ReturnType<typeof createTheme>;
  } & Omit<RenderOptions, 'wrapper'> = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Create mock city data helper
export const createMockCity = (overrides = {}) => ({
  id: '1',
  name: 'Test City',
  country: 'UA',
  lat: 50.4501,
  lon: 30.5234,
  lastUpdated: Date.now(),
  ...overrides,
});

// Create mock weather data helper
export const createMockWeather = (overrides = {}) => ({
  main: {
    temp: 20,
    feels_like: 18,
    temp_min: 15,
    temp_max: 25,
    pressure: 1013,
    humidity: 60,
  },
  weather: [
    {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d',
    },
  ],
  wind: {
    speed: 3.0,
    deg: 180,
  },
  visibility: 10000,
  name: 'Test City',
  ...overrides,
});

// Mock weather API response helper
export const createMockApiResponse = (
  data: unknown = null,
  error: unknown = null,
  isLoading = false,
) => ({
  data,
  error,
  isLoading,
  refetch: jest.fn().mockResolvedValue({ data }),
});

// Helper to create a mock store with specific state
export const createMockStore = (initialState: Record<string, unknown> = {}) => {
  return configureStore({
    reducer: {
      cities: citiesSlice,
      weatherApi: () => ({}),
    },
    preloadedState: {
      cities: {
        cities: [],
        ...(initialState.cities as Record<string, unknown>),
      },
      weatherApi: {},
      ...initialState,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Utility to wait for async operations
export const flushPromises = () =>
  new Promise(resolve => setTimeout(resolve, 0));

// Mock implementations
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

// Export everything from testing library
export * from '@testing-library/react';
