import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/app/utils/test.utils';
import AddCityDialog from './AddCityDialog';

// Mock the weather API hook
const mockUseGetWeatherByCityQuery = jest.fn();
jest.mock('@/app/store/api/weatherApi', () => ({
  useGetWeatherByCityQuery: mockUseGetWeatherByCityQuery,
}));

describe('AddCityDialog Component', () => {
  const mockOnClose = jest.fn();
  const mockOnAddCity = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onAddCity: mockOnAddCity,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetWeatherByCityQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
    });
  });

  it('renders dialog when open', () => {
    renderWithProviders(<AddCityDialog {...defaultProps} />);
    
    expect(screen.getByText('🏙️ Додати нове місто')).toBeInTheDocument();
    expect(screen.getByLabelText('🔍 Назва міста')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithProviders(<AddCityDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('🏙️ Додати нове місто')).not.toBeInTheDocument();
  });

  it('shows popular cities', () => {
    renderWithProviders(<AddCityDialog {...defaultProps} />);
    
    expect(screen.getByText('Київ')).toBeInTheDocument();
    expect(screen.getByText('Одеса')).toBeInTheDocument();
    expect(screen.getByText('Львів')).toBeInTheDocument();
  });

  it('handles city name input', () => {
    renderWithProviders(<AddCityDialog {...defaultProps} />);
    
    const input = screen.getByLabelText('🔍 Назва міста');
    fireEvent.change(input, { target: { value: 'Харків' } });
    
    expect(input).toHaveValue('Харків');
  });

  it('calls onClose when close button is clicked', () => {
    renderWithProviders(<AddCityDialog {...defaultProps} />);
    
    const closeButton = screen.getByTestId('CloseIcon').closest('button');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });
});
