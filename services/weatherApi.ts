import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:5000'; // Backend running on port 5000

export interface WeatherApiResponse {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  visibility: number;
  uvIndex: number;
  icon: string;
  location: string;
  timestamp: string;
  aiInsights?: string[];
}

export interface HourlyForecastResponse {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
  precipitationChance: number;
}

export interface WeeklyForecastResponse {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitationChance: number;
  humidity: number;
  windSpeed: number;
}

export interface TaskRecommendationResponse {
  taskId: string;
  recommendation: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

// Get authentication headers
const getAuthHeaders = async () => {
  const userSession = await AsyncStorage.getItem('userSession');
  if (!userSession) {
    throw new Error('User not authenticated');
  }
  
  const { token } = JSON.parse(userSession);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Fetch current weather
export const fetchCurrentWeather = async (lat: number, lon: number): Promise<WeatherApiResponse> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/weather/current?lat=${lat}&lon=${lon}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

// Fetch hourly forecast
export const fetchHourlyForecast = async (lat: number, lon: number): Promise<HourlyForecastResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/weather/hourly?lat=${lat}&lon=${lon}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Hourly forecast API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    throw error;
  }
};

// Fetch weekly forecast
export const fetchWeeklyForecast = async (lat: number, lon: number): Promise<WeeklyForecastResponse[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/weather/weekly?lat=${lat}&lon=${lon}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Weekly forecast API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weekly forecast:', error);
    throw error;
  }
};

// Get AI task recommendations
export const fetchTaskRecommendations = async (
  weatherData: WeatherApiResponse,
  userTasks: any[] = []
): Promise<TaskRecommendationResponse[]> => {
  try {
    const userSession = await AsyncStorage.getItem('userSession');
    if (!userSession) {
      throw new Error('User not authenticated');
    }

    const { token, user_id } = JSON.parse(userSession);
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${BASE_URL}/api/weather/analyze-tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id,
        weather_data: weatherData,
        user_tasks: userTasks,
      }),
    });

    if (!response.ok) {
      throw new Error(`Task recommendations API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching task recommendations:', error);
    throw error;
  }
};
