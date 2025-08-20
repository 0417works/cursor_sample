import express from 'express';
import { imageService } from '../services/imageService';

const router = express.Router();

// 画像検索
router.get('/search', async (req, res) => {
  try {
    const { query, count = 10 } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const images = await imageService.searchImages(query, Number(count));
    res.json(images);
  } catch (error: any) {
    console.error('Image search API error:', error);
    res.status(500).json({ error: 'Failed to search images' });
  }
});

// ランダム画像取得
router.get('/random', async (req, res) => {
  try {
    const { category } = req.query;
    const image = await imageService.getRandomImage(category as string);
    res.json(image);
  } catch (error: any) {
    console.error('Random image API error:', error);
    res.status(500).json({ error: 'Failed to get random image' });
  }
});

export default router;
