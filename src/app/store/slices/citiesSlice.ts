import { City } from '@/app/types/weather';
import { loadFromStorage, saveToStorage } from '@/app/utils/storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CitiesState {
  cities: City[];
}

const initialState: CitiesState = {
  cities: loadFromStorage('cities') || [],
};

export const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    addCity: (state, action: PayloadAction<City>) => {
      const existingCity = state.cities.find(
        city => city.id === action.payload.id,
      );
      if (!existingCity) {
        state.cities.push(action.payload);
        saveToStorage('cities', state.cities);
      }
    },
    removeCity: (state, action: PayloadAction<string>) => {
      state.cities = state.cities.filter(city => city.id !== action.payload);
      saveToStorage('cities', state.cities);
    },
    updateCityWeather: (state, action: PayloadAction<City>) => {
      const index = state.cities.findIndex(
        city => city.id === action.payload.id,
      );
      if (index !== -1) {
        state.cities[index] = action.payload;
        saveToStorage('cities', state.cities);
      }
    },
  },
});

export const { addCity, removeCity, updateCityWeather } = citiesSlice.actions;
export default citiesSlice.reducer;
