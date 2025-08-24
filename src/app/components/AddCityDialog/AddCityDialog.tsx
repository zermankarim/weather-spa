'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  Fade,
  InputAdornment,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  LocationCity as CityIcon,
  Public as CountryIcon,
  Thermostat as TempIcon,
  Add as AddIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { City } from '@/app/types/weather';
import { useGetWeatherByCityQuery } from '@/app/store/api/weatherApi';

interface AddCityDialogProps {
  open: boolean;
  onClose: () => void;
  onAddCity: (city: City) => void;
}

const popularCities = [
  'Київ',
  'Одеса',
  'Львів',
  'Харків',
  'Дніпро',
  'Запоріжжя',
  'Кривий Ріг',
  'Миколаїв',
  'Маріуполь',
  'Вінниця',
];

export default function AddCityDialog({
  open,
  onClose,
  onAddCity,
}: AddCityDialogProps) {
  const [cityName, setCityName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const theme = useTheme();

  const {
    data: weatherData,
    error,
    isLoading,
  } = useGetWeatherByCityQuery(searchQuery, {
    skip: !searchQuery,
  });

  // Очищаємо форму при відкритті діалогу
  useEffect(() => {
    if (open) {
      setCityName('');
      setSearchQuery('');
      setHasSearched(false);
    }
  }, [open]);

  const handleSearch = () => {
    if (cityName.trim()) {
      setSearchQuery(cityName.trim());
      setHasSearched(true);
    }
  };

  const handleQuickSearch = (city: string) => {
    setCityName(city);
    setSearchQuery(city);
    setHasSearched(true);
  };

  const handleAddCity = () => {
    if (weatherData) {
      const newCity: City = {
        id: `${weatherData.id}-${Date.now()}`,
        name: weatherData.name,
        country: weatherData.sys.country,
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
        weather: weatherData,
        lastUpdated: Date.now(),
      };
      onAddCity(newCity);
    }
    handleClose();
  };

  const handleClose = () => {
    setCityName('');
    setSearchQuery('');
    setHasSearched(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearInput = () => {
    setCityName('');
    setSearchQuery('');
    setHasSearched(false);
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return theme.palette.primary.main;
    if (temp < 10) return theme.palette.info.main;
    if (temp < 25) return theme.palette.success.main;
    if (temp < 35) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
      TransitionComponent={Fade}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
          position: 'relative',
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
            color: 'white',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <CityIcon />
            <Typography variant="h6" fontWeight={600}>
              🏙️ Додати нове місто
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: alpha(theme.palette.common.white, 0.1),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {/* Поле пошуку */}
          <TextField
            autoFocus
            margin="dense"
            label="🔍 Назва міста"
            fullWidth
            variant="outlined"
            value={cityName}
            onChange={e => setCityName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Наприклад: Одеса, Київ, Львів, Харків..."
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: cityName && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearInput} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Популярні міста */}
          {!hasSearched && (
            <Box mb={3}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                🇺🇦 Популярні міста України:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {popularCities.map(city => (
                  <Chip
                    key={city}
                    label={city}
                    variant="outlined"
                    clickable
                    size="small"
                    onClick={() => handleQuickSearch(city)}
                    sx={{
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Індикатор завантаження */}
          {isLoading && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: 2,
                mb: 2,
              }}
            >
              <CircularProgress size={40} thickness={4} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                🔄 Шукаємо інформацію про &quot;{cityName}&quot;...
              </Typography>
            </Paper>
          )}

          {/* Помилка пошуку */}
          {error && hasSearched && !isLoading && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>❌ Місто не знайдено</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Перевірте правильність написання або спробуйте:
              </Typography>
              <Box mt={1}>
                <Typography variant="caption" component="div">
                  • Використовуйте українські назви (Київ замість Kiev)
                </Typography>
                <Typography variant="caption" component="div">
                  • Перевірте правильність написання
                </Typography>
                <Typography variant="caption" component="div">
                  • Спробуйте англійською мовою
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Результат пошуку */}
          {weatherData && !isLoading && (
            <Fade in>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                }}
              >
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: 'transparent',
                    border: 'none',
                    p: 0,
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    ✅ Місто знайдено!
                  </Typography>
                </Alert>

                <Box display="flex" alignItems="start" gap={2}>
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0]?.icon}@2x.png`}
                    alt={weatherData.weather[0]?.description}
                    style={{
                      width: 64,
                      height: 64,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    }}
                  />
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CityIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        {weatherData.name}
                      </Typography>
                      <CountryIcon fontSize="small" color="action" />
                      <Chip
                        label={weatherData.sys.country}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <TempIcon
                        sx={{
                          color: getTemperatureColor(weatherData.main.temp),
                        }}
                      />
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          color: getTemperatureColor(weatherData.main.temp),
                        }}
                      >
                        {Math.round(weatherData.main.temp)}°C
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textTransform: 'capitalize', mb: 1 }}
                    >
                      🌤️ {weatherData.weather[0]?.description}
                    </Typography>

                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={`💧 ${weatherData.main.humidity}%`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`🌬️ ${weatherData.wind.speed} м/с`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`👁️ ${((weatherData.visibility ?? 0) / 1000).toFixed(1)} км`}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            ❌ Скасувати
          </Button>

          {!weatherData ? (
            <Button
              onClick={handleSearch}
              variant="contained"
              disabled={!cityName.trim() || isLoading}
              startIcon={
                isLoading ? <CircularProgress size={16} /> : <SearchIcon />
              }
              sx={{
                borderRadius: 2,
                minWidth: 120,
              }}
            >
              {isLoading ? 'Шукаємо...' : '🔍 Знайти'}
            </Button>
          ) : (
            <Button
              onClick={handleAddCity}
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                minWidth: 120,
              }}
            >
              ➕ Додати
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
