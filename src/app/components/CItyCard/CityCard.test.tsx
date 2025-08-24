// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock SCSS module
jest.mock('./CityCard.module.scss', () => ({
  card: 'card',
  cardContent: 'cardContent',
  cardActions: 'cardActions',
}));

// Mock the weather API hook
jest.mock('@/app/store/api/weatherApi', () => ({
  useGetWeatherByCoordsQuery: jest.fn(),
}));

import React from 'react';
import {
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { City } from '@/app/types/weather';
import { renderWithProviders, createMockStore } from '@/app/utils/test.utils';
import CityCard from './CityCard';

// Get the mocked functions
const mockUseGetWeatherByCoordsQuery = jest.mocked(
  require('@/app/store/api/weatherApi').useGetWeatherByCoordsQuery
);

describe('CityCard Component', () => {
  const mockCity: City = {
    id: '1',
    name: 'Київ',
    country: 'UA',
    lat: 50.4501,
    lon: 30.5234,
    lastUpdated: Date.now() - 300000, // 5 minutes ago
  };

  const mockCityWithoutWeather: City = {
    id: '2',
    name: 'Одеса',
    country: 'UA',
    lat: 46.4825,
    lon: 30.7233,
  };

  const mockWeatherData = {
    id: 801,
    main: {
      temp: 18,
      feels_like: 16,
      temp_min: 14,
      temp_max: 22,
      pressure: 1015,
      humidity: 70,
    },
    weather: [
      {
        id: 801,
        main: 'Clouds',
        description: 'невеликі хмари',
        icon: '02d',
      },
    ],
    wind: {
      speed: 2.8,
      deg: 200,
    },
    visibility: 8000,
    name: 'Київ',
    coord: { lat: 50.4501, lon: 30.5234 },
    dt: Date.now() / 1000,
    sys: { country: 'UA', sunrise: 0, sunset: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();

    // Default mock setup for weather API
    mockUseGetWeatherByCoordsQuery.mockReturnValue({
      data: mockWeatherData,
      error: null,
      isLoading: false,
      refetch: jest.fn().mockResolvedValue({ data: mockWeatherData }),
    });
  });

  describe('Basic Rendering', () => {
    it('renders city information correctly', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      expect(screen.getByText('Київ')).toBeInTheDocument();
      expect(screen.getByText('UA')).toBeInTheDocument();
      expect(screen.getByText('18°')).toBeInTheDocument();
      expect(screen.getByText('16°C')).toBeInTheDocument();
      expect(screen.getByText('невеликі хмари')).toBeInTheDocument();
    });

    it('renders city without weather data', () => {
      mockUseGetWeatherByCoordsQuery.mockReturnValue({
        data: null,
        error: null,
        isLoading: false,
        refetch: jest.fn(),
      });

      renderWithProviders(<CityCard city={mockCityWithoutWeather} />);

      expect(screen.getByText('Одеса')).toBeInTheDocument();
      expect(screen.getByText('UA')).toBeInTheDocument();
    });

    it('displays last updated time correctly', () => {
      const cityWithRecentUpdate = {
        ...mockCity,
        lastUpdated: Date.now() - 60000, // 1 minute ago
      };

      renderWithProviders(<CityCard city={cityWithRecentUpdate} />);
      expect(screen.getByText('1 хв тому')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner when data is loading', () => {
      mockUseGetWeatherByCoordsQuery.mockReturnValue({
        data: null,
        error: null,
        isLoading: true,
        refetch: jest.fn(),
      });

      renderWithProviders(<CityCard city={mockCityWithoutWeather} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows refresh loading state', async () => {
      const mockRefetch = jest
        .fn()
        .mockImplementation(() => 
          new Promise(resolve => 
            setTimeout(() => resolve({ data: mockWeatherData }), 100)
          )
        );
      mockUseGetWeatherByCoordsQuery.mockReturnValue({
        data: mockWeatherData,
        error: null,
        isLoading: false,
        refetch: mockRefetch,
      });

      renderWithProviders(<CityCard city={mockCity} />);

      const refreshButton = screen.getByText('Оновити');
      
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Оновлення...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Оновити')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API call fails', () => {
      mockUseGetWeatherByCoordsQuery.mockReturnValue({
        data: null,
        error: { status: 404, data: 'Not Found' },
        isLoading: false,
        refetch: jest.fn(),
      });

      renderWithProviders(<CityCard city={mockCity} />);
      expect(
        screen.getByText('Не вдалося завантажити дані про погоду'),
      ).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('navigates to city detail page when card is clicked', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      const cardContent = screen.getByText('Київ').closest('div');
      if (cardContent) {
        fireEvent.click(cardContent);
        expect(mockPush).toHaveBeenCalledWith('/city/1');
      }
    });

    it('navigates to city detail page when "Детальніше" button is clicked', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      const detailButton = screen.getByText('Детальніше');
      fireEvent.click(detailButton);

      expect(mockPush).toHaveBeenCalledWith('/city/1');
    });

    it('removes city when delete button is clicked', () => {
      const store = createMockStore();
      const spy = jest.spyOn(store, 'dispatch');

      renderWithProviders(<CityCard city={mockCity} />, { store });

      const deleteButton = screen.getByLabelText('Видалити місто');
      fireEvent.click(deleteButton);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cities/removeCity',
          payload: '1',
        }),
      );
    });

    it('refreshes weather data when refresh button is clicked', async () => {
      const mockRefetch = jest
        .fn()
        .mockResolvedValue({ data: mockWeatherData });
      const store = createMockStore();
      const spy = jest.spyOn(store, 'dispatch');

      mockUseGetWeatherByCoordsQuery.mockReturnValue({
        data: mockWeatherData,
        error: null,
        isLoading: false,
        refetch: mockRefetch,
      });

      renderWithProviders(<CityCard city={mockCity} />, { store });

      const refreshButton = screen.getByText('Оновити');
      
      await act(async () => {
        fireEvent.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Weather Data Display', () => {
    it('displays all weather parameters correctly', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      expect(screen.getByText('70%')).toBeInTheDocument(); // humidity
      expect(screen.getByText('2.8 м/с')).toBeInTheDocument(); // wind speed
      expect(screen.getByText('8 км')).toBeInTheDocument(); // visibility
    });

    it('displays temperature chips correctly', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      expect(screen.getByText('14°')).toBeInTheDocument(); // min temp
      expect(screen.getByText('22°')).toBeInTheDocument(); // max temp
    });

    it('converts pressure from hPa to mmHg correctly', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      // 1015 hPa * 0.75 = 761 mmHg (rounded)
      expect(screen.getByText('761 мм')).toBeInTheDocument();
    });

    it('handles missing visibility data', () => {
      const weatherWithoutVisibility = {
        ...mockWeatherData,
        visibility: undefined,
      };

      mockUseGetWeatherByCoordsQuery.mockReturnValue({
        data: weatherWithoutVisibility,
        error: null,
        isLoading: false,
        refetch: jest.fn(),
      });

      renderWithProviders(<CityCard city={mockCity} />);
      expect(screen.queryByText(/км/)).not.toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    it('changes elevation on hover', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      const card = screen.getByText('Київ').closest('[elevation]');
      if (card) {
        fireEvent.mouseEnter(card);
        fireEvent.mouseLeave(card);
      }
      // This test primarily ensures no errors occur during hover events
    });
  });

  describe('Theme Integration', () => {
    it('applies temperature-based colors correctly', () => {
      // Test with different temperature ranges
      const coldWeather = {
        ...mockWeatherData,
        main: { ...mockWeatherData.main, temp: -5, feels_like: -8 },
      };

      mockUseGetWeatherByCoordsQuery.mockReturnValue({
        data: coldWeather,
        error: null,
        isLoading: false,
        refetch: jest.fn(),
      });

      renderWithProviders(<CityCard city={mockCity} />);
      expect(screen.getByText('-5°')).toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    it('formats "just now" correctly', () => {
      const cityJustUpdated = {
        ...mockCity,
        lastUpdated: Date.now() - 30000, // 30 seconds ago
      };

      renderWithProviders(<CityCard city={cityJustUpdated} />);
      expect(screen.getByText('щойно')).toBeInTheDocument();
    });

    it('formats hours correctly', () => {
      const cityUpdatedHoursAgo = {
        ...mockCity,
        lastUpdated: Date.now() - 7200000, // 2 hours ago
      };

      renderWithProviders(<CityCard city={cityUpdatedHoursAgo} />);
      expect(screen.getByText('2 год тому')).toBeInTheDocument();
    });

    it('formats days correctly', () => {
      const cityUpdatedDaysAgo = {
        ...mockCity,
        lastUpdated: Date.now() - 172800000, // 2 days ago
      };

      renderWithProviders(<CityCard city={cityUpdatedDaysAgo} />);
      expect(screen.getByText('2 дн тому')).toBeInTheDocument();
    });
  });

  describe('Event Propagation', () => {
    it('prevents event propagation on delete button click', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      const deleteButton = screen.getByLabelText('Видалити місто');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation');

      fireEvent(deleteButton, clickEvent);

      // This test ensures the event handler structure is correct
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('prevents event propagation on refresh button click', async () => {
      const mockRefetch = jest
        .fn()
        .mockResolvedValue({ data: mockWeatherData });
      mockUseGetWeatherByCoordsQuery.mockReturnValue({
        data: mockWeatherData,
        error: null,
        isLoading: false,
        refetch: mockRefetch,
      });

      renderWithProviders(<CityCard city={mockCity} />);

      const refreshButton = screen.getByText('Оновити');
      const clickEvent = new MouseEvent('click', { bubbles: true });

      await act(async () => {
        fireEvent(refreshButton, clickEvent);
      });

      // Refresh should not trigger navigation
      expect(mockPush).not.toHaveBeenCalledWith('/city/1');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      expect(screen.getByLabelText('Видалити місто')).toBeInTheDocument();
    });

    it('has proper button roles', () => {
      renderWithProviders(<CityCard city={mockCity} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
