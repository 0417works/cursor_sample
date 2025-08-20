import axios from 'axios';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface ForecastData {
  city: string;
  forecasts: Array<{
    date: string;
    temperature: number;
    description: string;
    icon: string;
  }>;
}

// OpenWeatherMap APIの設定
const API_KEY = process.env.OPENWEATHER_API_KEY || 'demo-key';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 現在の天気を取得
export const getCurrentWeather = async (city: string): Promise<WeatherData> => {
  try {
    // APIキーがデモの場合はモックデータを返す
    if (API_KEY === 'demo-key') {
      return {
        city,
        temperature: 22,
        description: '晴れ',
        humidity: 65,
        windSpeed: 3.2,
        icon: '01d'
      };
    }

    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'ja'
      }
    });

    const data = response.data;
    return {
      city: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error('天気情報の取得に失敗しました');
  }
};

// 天気予報を取得
export const getForecast = async (city: string, days: number = 5): Promise<ForecastData> => {
  try {
    // APIキーがデモの場合はモックデータを返す
    if (API_KEY === 'demo-key') {
      const mockForecasts = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        mockForecasts.push({
          date: date.toISOString().split('T')[0],
          temperature: 20 + Math.floor(Math.random() * 10),
          description: ['晴れ', '曇り', '雨'][Math.floor(Math.random() * 3)],
          icon: '01d'
        });
      }
      
      return {
        city,
        forecasts: mockForecasts
      };
    }

    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'ja',
        cnt: days * 8 // 3時間ごとのデータ
      }
    });

    const data = response.data;
    const forecasts = data.list
      .filter((item: any, index: number) => index % 8 === 0) // 24時間ごと
      .slice(0, days)
      .map((item: any) => ({
        date: new Date(item.dt * 1000).toISOString().split('T')[0],
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }));

    return {
      city: data.city.name,
      forecasts
    };
  } catch (error) {
    console.error('Weather forecast API error:', error);
    throw new Error('天気予報の取得に失敗しました');
  }
};

// 天気サービスのテスト
export const testWeatherService = async (): Promise<boolean> => {
  try {
    const weather = await getCurrentWeather('Tokyo');
    return !!weather.city;
  } catch (error) {
    console.error('Weather service test failed:', error);
    return false;
  }
};
