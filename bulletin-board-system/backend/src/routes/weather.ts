import express from 'express';
import { weatherService } from '../services/weatherService';

const router = express.Router();

// 現在の天気取得
router.get('/current', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city || typeof city !== 'string') {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const weather = await weatherService.getCurrentWeather(city);
    res.json(weather);
  } catch (error: any) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// 天気予報取得
router.get('/forecast', async (req, res) => {
  try {
    const { city, days = 5 } = req.query;
    if (!city || typeof city !== 'string') {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const forecast = await weatherService.getForecast(city, Number(days));
    res.json(forecast);
  } catch (error: any) {
    console.error('Weather forecast API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

export default router;
