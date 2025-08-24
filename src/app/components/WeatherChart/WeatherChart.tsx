'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  DotProps,
  Area,
  AreaChart,
} from 'recharts';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  alpha,
  Paper,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ThermostatOutlined as TempIcon,
  WaterDrop as HumidityIcon,
  Air as WindIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { HourlyWeatherData } from '@/app/types/weather';

interface WeatherChartProps {
  data: HourlyWeatherData[];
  isLoading?: boolean;
}

interface ChartData {
  time: string;
  fullTime: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  hour: number;
}

type ChartMode = 'temperature' | 'humidity' | 'wind';

export default function WeatherChart({ data, isLoading }: WeatherChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('temperature');
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={48} thickness={4} />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          📊 Немає даних для відображення
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Спробуйте оновити дані або перевірте підключення до інтернету
        </Typography>
      </Paper>
    );
  }

  const chartData: ChartData[] = data.slice(0, 12).map(item => {
    const date = new Date(item.dt * 1000);
    return {
      time: date.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      fullTime: date.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      }),
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 10) / 10,
      description: item.weather[0]?.description || '',
      icon: item.weather[0]?.icon || '',
      hour: date.getHours(),
    };
  });

  const getChartConfig = () => {
    switch (chartMode) {
      case 'humidity':
        return {
          dataKey: 'humidity',
          color: theme.palette.info.main,
          gradientId: 'humidityGradient',
          unit: '%',
          label: 'Вологість',
          icon: <HumidityIcon />,
        };
      case 'wind':
        return {
          dataKey: 'windSpeed',
          color: theme.palette.success.main,
          gradientId: 'windGradient',
          unit: ' м/с',
          label: 'Швидкість вітру',
          icon: <WindIcon />,
        };
      default:
        return {
          dataKey: 'temperature',
          color: theme.palette.primary.main,
          gradientId: 'temperatureGradient',
          unit: '°C',
          label: 'Температура',
          icon: <TempIcon />,
        };
    }
  };

  const config = getChartConfig();

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: ChartData;
      value: number;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper
          elevation={8}
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            border: `2px solid ${config.color}`,
            borderRadius: 2,
            minWidth: 200,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            🕐 {data.fullTime}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {config.icon}
            <Typography variant="h6" color={config.color} fontWeight="bold">
              {payload[0].value}
              {config.unit}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textTransform: 'capitalize' }}
          >
            🌤️ {data.description}
          </Typography>
          {chartMode === 'temperature' && (
            <Box mt={1} display="flex" gap={1}>
              <Chip
                size="small"
                label={`💧 ${data.humidity}%`}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`🌬️ ${data.windSpeed} м/с`}
                variant="outlined"
              />
            </Box>
          )}
        </Paper>
      );
    }
    return null;
  };

  const CustomDot = (props: DotProps & { payload?: ChartData }) => {
    const { cx, cy, payload } = props;

    if (!cx || !cy || !payload) return null;

    const isNight = payload.hour >= 21 || payload.hour <= 6;

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r="8"
          fill={config.color}
          stroke={theme.palette.background.paper}
          strokeWidth="3"
          style={{
            filter: `drop-shadow(0 2px 4px ${alpha(config.color, 0.3)})`,
          }}
        />
        <circle
          cx={cx}
          cy={cy}
          r="4"
          fill={isNight ? theme.palette.grey[600] : theme.palette.warning.light}
        />
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          fontSize="12"
          fill={config.color}
          fontWeight="bold"
          style={{
            textShadow: `1px 1px 2px ${alpha(theme.palette.background.paper, 0.8)}`,
          }}
        >
          {payload[chartMode as keyof ChartData]}
          {config.unit}
        </text>
      </g>
    );
  };

  const getYAxisDomain = () => {
    const values = chartData.map(
      d => d[config.dataKey as keyof ChartData] as number,
    );
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 2;
    return [min - padding, max + padding];
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Переключатель режимов */}
      <Box display="flex" justifyContent="center" mb={3}>
        <ToggleButtonGroup
          value={chartMode}
          exclusive
          onChange={(_, newMode) => newMode && setChartMode(newMode)}
          aria-label="режим графіка"
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <ToggleButton value="temperature" aria-label="температура">
            <TempIcon sx={{ mr: 1 }} />
            Температура
          </ToggleButton>
          <ToggleButton value="humidity" aria-label="вологість">
            <HumidityIcon sx={{ mr: 1 }} />
            Вологість
          </ToggleButton>
          <ToggleButton value="wind" aria-label="вітер">
            <WindIcon sx={{ mr: 1 }} />
            Вітер
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* График */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 40,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <defs>
                <linearGradient
                  id={config.gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={config.color}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={config.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={alpha(theme.palette.divider, 0.3)}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: theme.palette.text.secondary,
                  fontWeight: 500,
                }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: theme.palette.text.secondary,
                  fontWeight: 500,
                }}
                domain={getYAxisDomain()}
                tickFormatter={value => `${Math.round(value)}${config.unit}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={config.dataKey}
                stroke={config.color}
                strokeWidth={3}
                fill={`url(#${config.gradientId})`}
                dot={<CustomDot />}
                activeDot={{
                  r: 10,
                  fill: config.color,
                  stroke: theme.palette.background.paper,
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        {/* Иконки погоды */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
          px={3}
        >
          {chartData.map((item, index) => (
            <Box
              key={index}
              textAlign="center"
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <img
                src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                alt={item.description}
                style={{
                  width: 40,
                  height: 40,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 0.5, fontWeight: 500 }}
              >
                {item.time}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
