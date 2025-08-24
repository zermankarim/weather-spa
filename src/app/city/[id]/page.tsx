'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  IconButton,
  Button,
  Chip,
  Paper,
  Skeleton,
  Alert,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ArrowBack as ArrowBackIcon,
  Thermostat as ThermostatIcon,
  Water as WaterIcon,
  Air as AirIcon,
  Compress as CompressIcon,
  WbSunny as SunIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
  Schedule as TimeIcon,
  TrendingUp as MaxTempIcon,
  TrendingDown as MinTempIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { RootState } from '@/app/store';
import {
  useGetHourlyForecastQuery,
  useGetWeatherByCoordsQuery,
} from '@/app/store/api/weatherApi';
import WeatherChart from '@/app/components/WeatherChart/WeatherChart';
import { useState } from 'react';

export default function CityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const cityId = params.id as string;
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Определяем размер экрана для адаптивности
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const city = useSelector((state: RootState) =>
    state.cities.cities.find(c => c.id === cityId),
  );

  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useGetWeatherByCoordsQuery(
    { lat: city?.lat || 0, lon: city?.lon || 0 },
    {
      skip: !city,
    },
  );

  const {
    data: forecastData,
    isLoading: isForecastLoading,
    error: forecastError,
    refetch: refetchForecast,
  } = useGetHourlyForecastQuery(
    { lat: city?.lat || 0, lon: city?.lon || 0 },
    {
      skip: !city,
    },
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchWeather(), refetchForecast()]);
    } catch (error) {
      console.error('Помилка оновлення:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!city) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
            textAlign: 'center',
            bgcolor: alpha(theme.palette.error.main, 0.05),
            border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`,
            borderRadius: 3,
          }}
        >
          <LocationIcon
            sx={{
              fontSize: { xs: 48, sm: 56, md: 64 },
              color: theme.palette.error.main,
              mb: 2,
            }}
          />
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            color="error" 
            gutterBottom
          >
            🏙️ Місто не знайдено
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Можливо, місто було видалено або сталася помилка
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            🏠 Повернутися на головну
          </Button>
        </Paper>
      </Container>
    );
  }

  const weather = weatherData || city.weather;

  const getWeatherIcon = (iconCode?: string) => {
    if (!iconCode) return '🌤️';
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };

  const formatUnixTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return theme.palette.primary.main;
    if (temp < 10) return theme.palette.info.main;
    if (temp < 25) return theme.palette.success.main;
    if (temp < 35) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const formatLastUpdated = () => {
    if (!city.lastUpdated) return '';
    const now = Date.now();
    const diff = now - city.lastUpdated;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'щойно оновлено';
    if (minutes < 60) return `оновлено ${minutes} хв тому`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `оновлено ${hours} год тому`;

    return `оновлено ${Math.floor(hours / 24)} дн тому`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Заголовок з кнопкою назад */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={{ xs: 2, sm: 3, md: 4 }}
        flexDirection={isMobile ? 'column' : 'row'}
        gap={isMobile ? 2 : 0}
      >
        <Box display="flex" alignItems="center" width={isMobile ? '100%' : 'auto'}>
          <Tooltip title="Повернутися назад" arrow>
            <IconButton
              onClick={() => router.push('/')}
              sx={{
                mr: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
              size={isMobile ? "medium" : "large"}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationIcon color="primary" />
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                component="h1" 
                fontWeight={600}
                sx={{ wordBreak: 'break-word' }}
              >
                {city.name}
              </Typography>
            </Box>
            <Box 
              display="flex" 
              alignItems="center" 
              gap={2}
              flexDirection={isMobile ? 'column' : 'row'}
              alignSelf={isMobile ? 'flex-start' : 'center'}
            >
              <Typography variant="h6" color="text.secondary">
                🌍 {city.country}
              </Typography>
              {city.lastUpdated && (
                <Chip
                  icon={<TimeIcon />}
                  label={formatLastUpdated()}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
          </Box>
        </Box>

        <Tooltip title="Оновити дані" arrow>
          <IconButton
            onClick={handleRefresh}
            disabled={isRefreshing || isWeatherLoading}
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.success.main, 0.2),
              },
              alignSelf: isMobile ? 'flex-end' : 'auto',
            }}
          >
            <RefreshIcon
              sx={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Помилки */}
      {(weatherError || forecastError) && (
        <Fade in>
          <Alert
            severity="warning"
            sx={{ mb: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}
            action={
              <Button
                size="small"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                Спробувати знову
              </Button>
            }
          >
            ⚠️ Не вдалося завантажити актуальні дані про погоду. Показуємо
            збережені дані.
          </Alert>
        </Fade>
      )}

      {weather && (
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Основна інформація про погоду */}
          <Grid xs={12} md={8}>
            <Card
              elevation={6}
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(getTemperatureColor(weather.main.temp), 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${getTemperatureColor(weather.main.temp)}, ${alpha(getTemperatureColor(weather.main.temp), 0.6)})`,
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {isWeatherLoading ? (
                  <Box textAlign="center">
                    <Skeleton
                      variant="circular"
                      width={isMobile ? 80 : isTablet ? 100 : 120}
                      height={isMobile ? 80 : isTablet ? 100 : 120}
                      sx={{ mx: 'auto', mb: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width={isMobile ? 150 : isTablet ? 180 : 200}
                      height={isMobile ? 40 : isTablet ? 50 : 60}
                      sx={{ mx: 'auto', mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width={isMobile ? 120 : isTablet ? 140 : 150}
                      height={isMobile ? 25 : isTablet ? 28 : 30}
                      sx={{ mx: 'auto' }}
                    />
                  </Box>
                ) : (
                  <Fade in timeout={500}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                    >
                      <img
                        src={getWeatherIcon(weather.weather[0]?.icon)}
                        alt={weather.weather[0]?.description}
                        style={{
                          width: isMobile ? 100 : isTablet ? 120 : 140,
                          height: isMobile ? 100 : isTablet ? 120 : 140,
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                        }}
                      />
                      <Typography
                        variant="h1"
                        component="div"
                        sx={{
                          fontSize: { xs: '3rem', sm: '3.5rem', md: '4.5rem' },
                          fontWeight: 200,
                          color: getTemperatureColor(weather.main.temp),
                          lineHeight: 1,
                          mb: 1,
                        }}
                      >
                        {Math.round(weather.main.temp)}°
                      </Typography>
                      <Typography
                        variant={isMobile ? "h6" : "h5"}
                        color="text.primary"
                        gutterBottom
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 500,
                          mb: 2,
                          textAlign: 'center',
                        }}
                      >
                        🌤️ {weather.weather[0]?.description}
                      </Typography>
                      <Typography
                        variant={isMobile ? "body1" : "h6"}
                        color="text.secondary"
                        sx={{ mb: 3, textAlign: 'center' }}
                      >
                        Відчувається як{' '}
                        <span
                          style={{
                            color: getTemperatureColor(weather.main.feels_like),
                          }}
                        >
                          {Math.round(weather.main.feels_like)}°C
                        </span>
                      </Typography>

                      <Box
                        display="flex"
                        gap={{ xs: 1, sm: 2 }}
                        flexWrap="wrap"
                        justifyContent="center"
                      >
                        <Chip
                          icon={<MinTempIcon />}
                          label={`Мін: ${Math.round(weather.main.temp_min)}°C`}
                          variant="filled"
                          color="primary"
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: 'inherit' },
                          }}
                        />
                        <Chip
                          icon={<MaxTempIcon />}
                          label={`Макс: ${Math.round(weather.main.temp_max)}°C`}
                          variant="filled"
                          color="error"
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: 'inherit' },
                          }}
                        />
                      </Box>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Додаткова інформація */}
          <Grid xs={12} md={4}>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid xs={6} md={12}>
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <WaterIcon color="info" fontSize={isMobile ? "medium" : "large"} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Вологість повітря
                      </Typography>
                      <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                        {weather.main.humidity}%
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid xs={6} md={12}>
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <CompressIcon color="warning" fontSize={isMobile ? "medium" : "large"} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Атмосферний тиск
                      </Typography>
                      <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                        {Math.round(weather.main.pressure * 0.75)} мм
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {weather.main.pressure} гПа
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid xs={6} md={12}>
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <AirIcon color="success" fontSize={isMobile ? "medium" : "large"} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Швидкість вітру
                      </Typography>
                      <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                        {weather.wind.speed} м/с
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Напрямок: {weather.wind.deg}°
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid xs={6} md={12}>
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <VisibilityIcon color="secondary" fontSize={isMobile ? "medium" : "large"} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Видимість
                      </Typography>
                      <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                        {weather.visibility
                          ? `${(weather.visibility / 1000).toFixed(1)} км`
                          : 'Н/Д'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Час сходу і заходу сонця */}
          {weather.sys && (
            <Grid xs={12}>
              <Paper
                elevation={4}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                }}
              >
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}
                >
                  ☀️ Сонячна активність
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                  <Grid xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                        }}
                      >
                        <SunIcon color="warning" fontSize={isMobile ? "medium" : "large"} />
                      </Box>
                      <Box>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          gutterBottom
                        >
                          🌅 Схід сонця
                        </Typography>
                        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                          {formatUnixTime(weather.sys.sunrise)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.grey[600], 0.1),
                        }}
                      >
                        <SunIcon
                          sx={{ color: theme.palette.grey[600] }}
                          fontSize={isMobile ? "medium" : "large"}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          gutterBottom
                        >
                          🌇 Захід сонця
                        </Typography>
                        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                          {formatUnixTime(weather.sys.sunset)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Графік погоди по годинах */}
          {(forecastData || isForecastLoading) && (
            <Grid xs={12}>
              <Card elevation={6} sx={{ overflow: 'hidden' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    📊 Погодинний прогноз
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <WeatherChart
                    data={forecastData?.list || []}
                    isLoading={isForecastLoading}
                  />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}
