'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Fab,
  Box,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { addCity } from './store/slices/citiesSlice';
import { City } from './types/weather';
import CityCard from './components/CItyCard/CityCard';
import AddCityDialog from './components/AddCityDialog/AddCityDialog';
import { useCities } from './hooks/useCities';

export default function HomePage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useDispatch();
  
  // Используем новый хук для работы с городами
  const { cities, refreshAllCitiesWeather } = useCities();

  const handleAddCity = (city: City) => {
    dispatch(addCity(city));
    setIsAddDialogOpen(false);
  };

  // Обработчик для ручного обновления погоды всех городов
  const handleRefreshAllWeather = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllCitiesWeather();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Погода у ваших містах
        </Typography>
        
        {cities.length > 0 && (
          <Button
            variant="outlined"
            startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRefreshAllWeather}
            disabled={isRefreshing}
            sx={{ minWidth: 200 }}
          >
            {isRefreshing ? 'Оновлення...' : 'Оновити всю погоду'}
          </Button>
        )}
      </Box>

      {/* Индикатор обновления погоды */}
      {isRefreshing && (
        <Alert severity="info" sx={{ mb: 3 }}>
          🔄 Оновлюємо погоду для всіх міст... Будь ласка, зачекайте.
        </Alert>
      )}

      {cities.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас поки що немає доданих міст
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Натисніть кнопку &quot;+&quot; щоб додати перше місто
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {cities.map(city => (
            <Grid item xs={12} sm={6} md={4} key={city.id}>
              <CityCard city={city} />
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="додати місто"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => setIsAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <AddCityDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddCity={handleAddCity}
      />
    </Container>
  );
}
