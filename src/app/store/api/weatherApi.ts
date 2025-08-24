import { HourlyWeatherData, WeatherData } from '@/app/types/weather';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  }),
  tagTypes: ['Weather'],
  endpoints: builder => ({
    getWeatherByCity: builder.query<WeatherData, string>({
      query: cityName =>
        `weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=uk`,
      providesTags: ['Weather'],
    }),
    getWeatherByCoords: builder.query<
      WeatherData,
      { lat: number; lon: number }
    >({
      query: ({ lat, lon }) =>
        `weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=uk`,
      providesTags: ['Weather'],
    }),
    getHourlyForecast: builder.query<
      { list: HourlyWeatherData[] },
      { lat: number; lon: number }
    >({
      query: ({ lat, lon }) =>
        `forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=uk&cnt=24`,
    }),
  }),
});

export const {
  useGetWeatherByCityQuery,
  useGetWeatherByCoordsQuery,
  useGetHourlyForecastQuery,
} = weatherApi;
