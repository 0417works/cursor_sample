import axios from 'axios';

interface ImageData {
  id: string;
  url: string;
  alt: string;
  photographer: string;
  width: number;
  height: number;
}

interface ImageSearchResult {
  images: ImageData[];
  total: number;
  page: number;
}

// Unsplash APIの設定
const API_KEY = process.env.UNSPLASH_API_KEY || 'demo-key';
const BASE_URL = 'https://api.unsplash.com';

// 画像検索
export const searchImages = async (query: string, count: number = 10): Promise<ImageSearchResult> => {
  try {
    // APIキーがデモの場合はモックデータを返す
    if (API_KEY === 'demo-key') {
      const mockImages: ImageData[] = [];
      for (let i = 0; i < count; i++) {
        mockImages.push({
          id: `mock-${i}`,
          url: `https://picsum.photos/400/300?random=${i}`,
          alt: `${query}の画像${i + 1}`,
          photographer: 'Demo User',
          width: 400,
          height: 300
        });
      }
      
      return {
        images: mockImages,
        total: count,
        page: 1
      };
    }

    const response = await axios.get(`${BASE_URL}/search/photos`, {
      headers: {
        'Authorization': `Client-ID ${API_KEY}`
      },
      params: {
        query,
        per_page: count,
        page: 1
      }
    });

    const data = response.data;
    const images: ImageData[] = data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      alt: photo.alt_description || query,
      photographer: photo.user.name,
      width: photo.width,
      height: photo.height
    }));

    return {
      images,
      total: data.total,
      page: 1
    };
  } catch (error) {
    console.error('Image search API error:', error);
    throw new Error('画像検索に失敗しました');
  }
};

// ランダム画像取得
export const getRandomImage = async (category?: string): Promise<ImageData> => {
  try {
    // APIキーがデモの場合はモックデータを返す
    if (API_KEY === 'demo-key') {
      return {
        id: 'mock-random',
        url: `https://picsum.photos/800/600?random=${Date.now()}`,
        alt: category ? `${category}の画像` : 'ランダム画像',
        photographer: 'Demo User',
        width: 800,
        height: 600
      };
    }

    const response = await axios.get(`${BASE_URL}/photos/random`, {
      headers: {
        'Authorization': `Client-ID ${API_KEY}`
      },
      params: category ? { query: category } : {}
    });

    const photo = response.data;
    return {
      id: photo.id,
      url: photo.urls.regular,
      alt: photo.alt_description || 'ランダム画像',
      photographer: photo.user.name,
      width: photo.width,
      height: photo.height
    };
  } catch (error) {
    console.error('Random image API error:', error);
    throw new Error('ランダム画像の取得に失敗しました');
  }
};

// カテゴリー別画像取得
export const getImagesByCategory = async (category: string, count: number = 10): Promise<ImageSearchResult> => {
  try {
    // APIキーがデモの場合はモックデータを返す
    if (API_KEY === 'demo-key') {
      const mockImages: ImageData[] = [];
      for (let i = 0; i < count; i++) {
        mockImages.push({
          id: `mock-${category}-${i}`,
          url: `https://picsum.photos/400/300?random=${i + 100}`,
          alt: `${category}の画像${i + 1}`,
          photographer: 'Demo User',
          width: 400,
          height: 300
        });
      }
      
      return {
        images: mockImages,
        total: count,
        page: 1
      };
    }

    const response = await axios.get(`${BASE_URL}/search/photos`, {
      headers: {
        'Authorization': `Client-ID ${API_KEY}`
      },
      params: {
        query: category,
        per_page: count,
        page: 1
      }
    });

    const data = response.data;
    const images: ImageData[] = data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      alt: photo.alt_description || category,
      photographer: photo.user.name,
      width: photo.width,
      height: photo.height
    }));

    return {
      images,
      total: data.total,
      page: 1
    };
  } catch (error) {
    console.error('Category images API error:', error);
    throw new Error('カテゴリー画像の取得に失敗しました');
  }
};

// 画像サービスのテスト
export const testImageService = async (): Promise<boolean> => {
  try {
    const image = await getRandomImage();
    return !!image.url;
  } catch (error) {
    console.error('Image service test failed:', error);
    return false;
  }
};
