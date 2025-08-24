'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Thermostat as ThermostatIcon,
  Water as WaterIcon,
  Air as AirIcon,
  Compress as CompressIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import styles from './CityCard.module.scss';
import { City } from '@/app/types/weather';
import { useGetWeatherByCoordsQuery } from '@/app/store/api/weatherApi';
import { removeCity, updateCityWeather } from '@/app/store/slices/citiesSlice';

interface CityCardProps {
  city: City;
}

export default function CityCard({ city }: CityCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();

  const {
    data: weatherData,
    error,
    isLoading,
    refetch,
  } = useGetWeatherByCoordsQuery(
    { lat: city.lat, lon: city.lon },
    {
      skip: !city.lat || !city.lon,
    },
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await refetch();
      if (result.data) {
        const updatedCity: City = {
          ...city,
          weather: result.data,
          lastUpdated: Date.now(),
        };
        dispatch(updateCityWeather(updatedCity));
      }
    } catch (error) {
      console.error('Error refreshing weather:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = () => {
    dispatch(removeCity(city.id));
  };

  const handleCardClick = () => {
    router.push(`/city/${city.id}`);
  };

  const getWeatherIcon = (iconCode?: string) => {
    if (!iconCode) return '🌤️';
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return theme.palette.primary.main;
    if (temp < 10) return theme.palette.info.main;
    if (temp < 25) return theme.palette.success.main;
    if (temp < 35) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const formatLastUpdated = (timestamp?: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'щойно';
    if (minutes < 60) return `${minutes} хв тому`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} год тому`;

    const days = Math.floor(hours / 24);
    return `${days} дн тому`;
  };

  const weather = weatherData || city.weather;
  const isDataLoading = isLoading || isRefreshing;

  return (
    <Card
      className={styles.card}
      elevation={isHovered ? 8 : 3}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        background: weather
          ? `linear-gradient(135deg, ${alpha(getTemperatureColor(weather.main.temp), 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
          : theme.palette.background.paper,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: weather
            ? `linear-gradient(90deg, ${getTemperatureColor(weather.main.temp)}, ${alpha(getTemperatureColor(weather.main.temp), 0.6)})`
            : theme.palette.primary.main,
        },
      }}
    >
      <CardContent
        className={styles.cardContent}
        onClick={handleCardClick}
        sx={{ pb: 1 }}
      >
        {/* Заголовок */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box flex={1}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {city.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle1" color="text.secondary">
                {city.country}
              </Typography>
              {city.lastUpdated && (
                <Chip
                  icon={<ScheduleIcon />}
                  label={formatLastUpdated(city.lastUpdated)}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 20,
                    '& .MuiChip-label': { px: 1, fontSize: '0.7rem' },
                  }}
                />
              )}
            </Box>
          </Box>

          <Tooltip title="Видалити місто" arrow>
            <IconButton
              onClick={e => {
                e.stopPropagation();
                handleDelete();
              }}
              size="small"
              color="error"
              sx={{
                opacity: isHovered ? 1 : 0.7,
                transition: 'opacity 0.3s ease',
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Ошибка */}
        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mt: 2, fontSize: '0.875rem' }}>
              Не вдалося завантажити дані про погоду
            </Alert>
          </Fade>
        )}

        {/* Загрузка */}
        {isDataLoading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        )}

        {/* Информация о погоде */}
        {weather && !isDataLoading && (
          <Fade in timeout={500}>
            <Box>
              {/* Основная информация */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <img
                    src={getWeatherIcon(weather.weather[0]?.icon)}
                    alt={weather.weather[0]?.description}
                    style={{
                      width: 80,
                      height: 80,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h2"
                      component="div"
                      sx={{
                        fontSize: '2.5rem',
                        fontWeight: 300,
                        color: getTemperatureColor(weather.main.temp),
                        lineHeight: 1,
                      }}
                    >
                      {Math.round(weather.main.temp)}°
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textTransform: 'capitalize', mt: 0.5 }}
                    >
                      {weather.weather[0]?.description}
                    </Typography>
                  </Box>
                </Box>

                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">
                    Відчувається як
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: getTemperatureColor(weather.main.feels_like) }}
                  >
                    {Math.round(weather.main.feels_like)}°C
                  </Typography>
                </Box>
              </Box>

              {/* Минимальная и максимальная температура */}
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  icon={<ThermostatIcon />}
                  label={`${Math.round(weather.main.temp_min)}°`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  icon={<ThermostatIcon />}
                  label={`${Math.round(weather.main.temp_max)}°`}
                  size="small"
                  variant="outlined"
                  color="error"
                />
              </Box>

              {/* Детали погоды */}
              <Box
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gap={1.5}
                sx={{
                  '& > div': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateY(-1px)',
                    },
                  },
                }}
              >
                <Tooltip title="Вологість повітря" arrow>
                  <Box>
                    <WaterIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Вологість
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {weather.main.humidity}%
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>

                <Tooltip title="Атмосферний тиск" arrow>
                  <Box>
                    <CompressIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Тиск
                      </Typography>{' '}
                      <Typography variant="body2" fontWeight={500}>
                        {Math.round(weather.main.pressure * 0.75)} мм
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>

                <Tooltip title="Швидкість вітру" arrow>
                  <Box>
                    <AirIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Вітер
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {weather.wind.speed} м/с
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>

                {weather.visibility && (
                  <Tooltip title="Видимість" arrow>
                    <Box>
                      <VisibilityIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Видимість
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {Math.round(weather.visibility / 1000)} км
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Fade>
        )}
      </CardContent>

      <CardActions
        className={styles.cardActions}
        sx={{
          px: 2,
          pb: 2,
          justifyContent: 'space-between',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Button
          size="small"
          startIcon={
            isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />
          }
          onClick={e => {
            e.stopPropagation();
            handleRefresh();
          }}
          disabled={isRefreshing || isLoading}
          variant="outlined"
          sx={{
            minWidth: 100,
            borderRadius: 2,
          }}
        >
          {isRefreshing ? 'Оновлення...' : 'Оновити'}
        </Button>

        <Button
          size="small"
          onClick={handleCardClick}
          variant="contained"
          sx={{
            minWidth: 100,
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          Детальніше
        </Button>
      </CardActions>
    </Card>
  );
}
