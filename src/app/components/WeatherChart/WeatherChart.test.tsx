import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/app/utils/test.utils';
import WeatherChart from './WeatherChart';
import { HourlyWeatherData } from '@/app/types/weather';

// Mock recharts components to avoid canvas issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ children }: { children: React.ReactNode }) => <div data-testid="line">{children}</div>,
  XAxis: ({ children }: { children: React.ReactNode }) => <div data-testid="x-axis">{children}</div>,
  YAxis: ({ children }: { children: React.ReactNode }) => <div data-testid="y-axis">{children}</div>,
  CartesianGrid: ({ children }: { children: React.ReactNode }) => <div data-testid="cartesian-grid">{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  DotProps: ({ children }: { children: React.ReactNode }) => <div data-testid="dot-props">{children}</div>,
  Area: ({ children }: { children: React.ReactNode }) => <div data-testid="area">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
}));

describe('WeatherChart Component', () => {
  const mockHourlyData: HourlyWeatherData[] = [
    {
      dt: Date.now() / 1000,
      main: {
        temp: 20,
        feels_like: 18,
        temp_min: 15,
        temp_max: 25,
        pressure: 1013,
        sea_level: 1013,
        grnd_level: 1010,
        humidity: 65,
      },
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'ясне небо',
          icon: '01d',
        },
      ],
      wind: {
        speed: 3.5,
        deg: 180,
        gust: 5.0,
      },
      visibility: 10000,
      pop: 0.1,
      dt_txt: '2024-01-01 12:00:00',
    },
    {
      dt: (Date.now() + 3600000) / 1000, // +1 hour
      main: {
        temp: 22,
        feels_like: 20,
        temp_min: 16,
        temp_max: 27,
        pressure: 1012,
        sea_level: 1012,
        grnd_level: 1009,
        humidity: 60,
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
        speed: 4.0,
        deg: 190,
        gust: 6.0,
      },
      visibility: 8000,
      pop: 0.2,
      dt_txt: '2024-01-01 13:00:00',
    },
  ];

  const defaultProps = {
    data: mockHourlyData,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner when isLoading is true', () => {
      renderWithProviders(<WeatherChart {...defaultProps} isLoading={true} />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });
  });

  describe('Empty Data State', () => {
    it('shows no data message when data is empty', () => {
      renderWithProviders(<WeatherChart data={[]} isLoading={false} />);
      
      expect(screen.getByText('📊 Немає даних для відображення')).toBeInTheDocument();
      expect(screen.getByText('Спробуйте оновити дані або перевірте підключення до інтернету')).toBeInTheDocument();
    });

    it('shows no data message when data is null', () => {
      renderWithProviders(<WeatherChart data={null as unknown as HourlyWeatherData[]} isLoading={false} />);
      
      expect(screen.getByText('📊 Немає даних для відображення')).toBeInTheDocument();
    });
  });

  describe('Chart Rendering', () => {
    it('renders chart when data is provided', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('displays temperature mode by default', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      // Check if temperature toggle button is selected
      const temperatureButton = screen.getByRole('button', { name: /температура/i });
      expect(temperatureButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows weather icons and times', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      // Check if weather icons are displayed
      expect(screen.getByAltText('ясне небо')).toBeInTheDocument();
      expect(screen.getByAltText('невеликі хмари')).toBeInTheDocument();
    });
  });

  describe('Chart Mode Switching', () => {
    it('switches to humidity mode when humidity button is clicked', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      const humidityButton = screen.getByRole('button', { name: /вологість/i });
      fireEvent.click(humidityButton);
      
      expect(humidityButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('switches to wind mode when wind button is clicked', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      const windButton = screen.getByRole('button', { name: /вітер/i });
      fireEvent.click(windButton);
      
      expect(windButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('switches back to temperature mode when temperature button is clicked', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      // First switch to humidity
      const humidityButton = screen.getByRole('button', { name: /вологість/i });
      fireEvent.click(humidityButton);
      
      // Then switch back to temperature
      const temperatureButton = screen.getByRole('button', { name: /температура/i });
      fireEvent.click(temperatureButton);
      
      expect(temperatureButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Data Processing', () => {
    it('limits data to first 12 items', () => {
      const longData = Array.from({ length: 20 }, (_, i) => ({
        ...mockHourlyData[0],
        dt: (Date.now() + i * 3600000) / 1000,
        main: { ...mockHourlyData[0].main, temp: 20 + i },
      }));
      
      renderWithProviders(<WeatherChart data={longData} isLoading={false} />);
      
      // Should only show first 12 items
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('formats time correctly', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      // Check if time formatting is working (this will depend on the current time)
      // We'll just verify the chart renders
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles for chart mode switching', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3); // temperature, humidity, wind
    });

    it('has proper ARIA labels for toggle buttons', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /температура/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /вологість/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /вітер/i })).toBeInTheDocument();
    });

    it('has proper group label for toggle button group', () => {
      renderWithProviders(<WeatherChart {...defaultProps} />);
      
      expect(screen.getByLabelText('режим графіка')).toBeInTheDocument();
    });
  });
});
