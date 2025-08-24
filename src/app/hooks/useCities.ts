import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { updateCityWeather } from '@/app/store/slices/citiesSlice';
import { City, WeatherData } from '@/app/types/weather';

export const useCities = () => {
  const dispatch = useDispatch();
  const cities = useSelector((state: RootState) => state.cities.cities);

  // Функция для обновления погоды конкретного города
  const updateCityWeatherData = useCallback(async (city: City) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&units=metric&lang=uk`
      );
      
      if (response.ok) {
        const weatherData: WeatherData = await response.json();
        const updatedCity: City = {
          ...city,
          weather: weatherData,
          lastUpdated: Date.now(),
        };
        dispatch(updateCityWeather(updatedCity));
      }
    } catch (error) {
      console.error(`Помилка оновлення погоди для міста ${city.name}:`, error);
    }
  }, [dispatch]);

  // Функция для массового обновления погоды всех городов
  const refreshAllCitiesWeather = useCallback(async () => {
    if (cities.length === 0) return;

    console.log('🔄 Оновлення погоди для всіх міст...');
    
    // Обновляем погоду для всех городов параллельно
    const updatePromises = cities.map(city => updateCityWeatherData(city));
    
    try {
      await Promise.allSettled(updatePromises);
      console.log('✅ Погода для всіх міст оновлена');
    } catch (error) {
      console.error('❌ Помилка при оновленні погоди:', error);
    }
  }, [cities, updateCityWeatherData]);

  // Автоматическое обновление погоды при загрузке страницы
  useEffect(() => {
    // Проверяем, есть ли сохраненные города
    if (cities.length > 0) {
      // Проверяем, нужно ли обновлять погоду (если прошло больше 30 минут)
      const shouldUpdate = cities.some(city => {
        if (!city.lastUpdated) return true;
        const timeDiff = Date.now() - city.lastUpdated;
        const thirtyMinutes = 30 * 60 * 1000; // 30 минут в миллисекундах
        return timeDiff > thirtyMinutes;
      });

      if (shouldUpdate) {
        console.log('🔄 Автоматичне оновлення погоди при завантаженні сторінки...');
        refreshAllCitiesWeather();
      } else {
        console.log('ℹ️ Дані про погоду актуальні, оновлення не потрібне');
      }
    }
  }, [cities, refreshAllCitiesWeather]); // Добавляем зависимости

  return {
    cities,
    refreshAllCitiesWeather,
    updateCityWeatherData,
  };
};
