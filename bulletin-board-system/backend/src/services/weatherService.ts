import axios from 'axios';

// OpenWeatherMap APIの設定
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// デフォルトの都市（東京）
const DEFAULT_CITY = 'Tokyo';
const DEFAULT_COUNTRY_CODE = 'JP';

// 天気情報の取得
export const getWeatherInfo = async (city?: string, countryCode?: string): Promise<string | null> => {
  try {
    if (!WEATHER_API_KEY) {
      console.warn('Weather API key not configured');
      return null;
    }

    const targetCity = city || DEFAULT_CITY;
    const targetCountryCode = countryCode || DEFAULT_COUNTRY_CODE;

    // 現在の天気情報を取得
    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        q: `${targetCity},${targetCountryCode}`,
        appid: WEATHER_API_KEY,
        units: 'metric', // 摂氏温度
        lang: 'ja' // 日本語
      },
      timeout: 5000 // 5秒のタイムアウト
    });

    const weatherData = response.data;
    
    // 天気情報の整形
    const temperature = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;
    const windSpeed = Math.round(weatherData.wind.speed * 3.6); // m/s から km/h に変換

    // 絵文字の選択
    const weatherEmoji = getWeatherEmoji(weatherData.weather[0].id);
    
    return `${weatherEmoji} ${targetCity}: ${temperature}°C, ${description}, 湿度: ${humidity}%, 風速: ${windSpeed}km/h`;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('Weather API: Invalid API key');
      } else if (error.response?.status === 404) {
        console.error('Weather API: City not found');
      } else if (error.code === 'ECONNABORTED') {
        console.error('Weather API: Request timeout');
      } else {
        console.error('Weather API error:', error.response?.status, error.response?.data);
      }
    } else {
      console.error('Weather service error:', error);
    }
    return null;
  }
};

// 天気IDに基づいて絵文字を選択
const getWeatherEmoji = (weatherId: number): string => {
  if (weatherId >= 200 && weatherId < 300) return '⛈️'; // 雷雨
  if (weatherId >= 300 && weatherId < 400) return '🌧️'; // 霧雨
  if (weatherId >= 500 && weatherId < 600) return '🌧️'; // 雨
  if (weatherId >= 600 && weatherId < 700) return '❄️'; // 雪
  if (weatherId >= 700 && weatherId < 800) return '🌫️'; // 霧
  if (weatherId === 800) return '☀️'; // 晴れ
  if (weatherId === 801) return '🌤️'; // 晴れ時々曇り
  if (weatherId === 802) return '⛅'; // 晴れ曇り
  if (weatherId === 803) return '🌥️'; // 曇り時々晴れ
  if (weatherId === 804) return '☁️'; // 曇り
  return '🌤️'; // デフォルト
};

// 複数都市の天気情報を取得
export const getMultipleCitiesWeather = async (cities: Array<{city: string, countryCode: string}>): Promise<Array<{city: string, weather: string | null}>> => {
  try {
    const weatherPromises = cities.map(async ({ city, countryCode }) => {
      const weather = await getWeatherInfo(city, countryCode);
      return { city, weather };
    });

    const results = await Promise.allSettled(weatherPromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to get weather for ${cities[index].city}:`, result.reason);
        return { city: cities[index].city, weather: null };
      }
    });

  } catch (error) {
    console.error('Multiple cities weather error:', error);
    return cities.map(({ city }) => ({ city, weather: null }));
  }
};

// 天気予報の取得（5日間）
export const getWeatherForecast = async (city?: string, countryCode?: string): Promise<any | null> => {
  try {
    if (!WEATHER_API_KEY) {
      console.warn('Weather API key not configured');
      return null;
    }

    const targetCity = city || DEFAULT_CITY;
    const targetCountryCode = countryCode || DEFAULT_COUNTRY_CODE;

    const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
      params: {
        q: `${targetCity},${targetCountryCode}`,
        appid: WEATHER_API_KEY,
        units: 'metric',
        lang: 'ja'
      },
      timeout: 10000
    });

    return response.data;

  } catch (error) {
    console.error('Weather forecast error:', error);
    return null;
  }
};

// 天気サービスのヘルスチェック
export const checkWeatherServiceHealth = async (): Promise<boolean> => {
  try {
    if (!WEATHER_API_KEY) {
      return false;
    }

    const weather = await getWeatherInfo('Tokyo', 'JP');
    return weather !== null;

  } catch (error) {
    console.error('Weather service health check failed:', error);
    return false;
  }
};
