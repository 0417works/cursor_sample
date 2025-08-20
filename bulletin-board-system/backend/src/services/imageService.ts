import axios from 'axios';

// Unsplash APIの設定
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// 画像検索の結果型定義
export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

// 画像検索の実行
export const searchRelatedImages = async (query: string, count: number = 5): Promise<UnsplashImage[] | null> => {
  try {
    if (!UNSPLASH_API_KEY) {
      console.warn('Unsplash API key not configured');
      return null;
    }

    // 検索クエリの最適化
    const searchQuery = optimizeSearchQuery(query);
    
    const response = await axios.get(`${UNSPLASH_BASE_URL}/search/photos`, {
      params: {
        query: searchQuery,
        per_page: count,
        orientation: 'landscape', // 横長の画像を優先
        order_by: 'relevant' // 関連性の高い順
      },
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
      },
      timeout: 10000 // 10秒のタイムアウト
    });

    const images = response.data.results.map((image: any) => ({
      id: image.id,
      urls: {
        small: image.urls.small,
        regular: image.urls.regular,
        full: image.urls.full
      },
      alt_description: image.alt_description || 'No description available',
      description: image.description || 'No description available',
      user: {
        name: image.user.name,
        username: image.user.username
      },
      links: {
        html: image.links.html
      }
    }));

    return images;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('Unsplash API: Invalid API key');
      } else if (error.response?.status === 403) {
        console.error('Unsplash API: Rate limit exceeded');
      } else if (error.code === 'ECONNABORTED') {
        console.error('Unsplash API: Request timeout');
      } else {
        console.error('Unsplash API error:', error.response?.status, error.response?.data);
      }
    } else {
      console.error('Image service error:', error);
    }
    return null;
  }
};

// 検索クエリの最適化
const optimizeSearchQuery = (query: string): string => {
  // 日本語のキーワードを英語に変換（基本的な変換）
  const japaneseToEnglish: { [key: string]: string } = {
    '天気': 'weather',
    '雨': 'rain',
    '雪': 'snow',
    '晴れ': 'sunny',
    '曇り': 'cloudy',
    '春': 'spring',
    '夏': 'summer',
    '秋': 'autumn',
    '冬': 'winter',
    '花': 'flower',
    '桜': 'cherry blossom',
    '紅葉': 'autumn leaves',
    '海': 'ocean',
    '山': 'mountain',
    '空': 'sky',
    '夕日': 'sunset',
    '朝日': 'sunrise',
    '夜景': 'night view',
    '都市': 'city',
    '自然': 'nature'
  };

  let optimizedQuery = query;

  // 日本語キーワードの置換
  Object.entries(japaneseToEnglish).forEach(([japanese, english]) => {
    optimizedQuery = optimizedQuery.replace(new RegExp(japanese, 'g'), english);
  });

  // 特殊文字の除去
  optimizedQuery = optimizedQuery.replace(/[^\w\s]/g, ' ');

  // 複数のスペースを単一のスペースに変換
  optimizedQuery = optimizedQuery.replace(/\s+/g, ' ').trim();

  // 空文字列の場合はデフォルトクエリを使用
  if (!optimizedQuery) {
    optimizedQuery = 'nature landscape';
  }

  return optimizedQuery;
};

// ランダム画像の取得
export const getRandomImage = async (query?: string): Promise<UnsplashImage | null> => {
  try {
    if (!UNSPLASH_API_KEY) {
      console.warn('Unsplash API key not configured');
      return null;
    }

    const searchQuery = query ? optimizeSearchQuery(query) : 'nature';

    const response = await axios.get(`${UNSPLASH_BASE_URL}/photos/random`, {
      params: {
        query: searchQuery,
        orientation: 'landscape'
      },
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
      },
      timeout: 10000
    });

    const image = response.data;
    
    return {
      id: image.id,
      urls: {
        small: image.urls.small,
        regular: image.urls.regular,
        full: image.urls.full
      },
      alt_description: image.alt_description || 'No description available',
      description: image.description || 'No description available',
      user: {
        name: image.user.name,
        username: image.user.username
      },
      links: {
        html: image.links.html
      }
    };

  } catch (error) {
    console.error('Get random image error:', error);
    return null;
  }
};

// 画像の統計情報取得
export const getImageStats = async (imageId: string): Promise<any | null> => {
  try {
    if (!UNSPLASH_API_KEY) {
      console.warn('Unsplash API key not configured');
      return null;
    }

    const response = await axios.get(`${UNSPLASH_BASE_URL}/photos/${imageId}/statistics`, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
      },
      timeout: 10000
    });

    return response.data;

  } catch (error) {
    console.error('Get image stats error:', error);
    return null;
  }
};

// 画像サービスのヘルスチェック
export const checkImageServiceHealth = async (): Promise<boolean> => {
  try {
    if (!UNSPLASH_API_KEY) {
      return false;
    }

    const images = await searchRelatedImages('nature', 1);
    return images !== null && images.length > 0;

  } catch (error) {
    console.error('Image service health check failed:', error);
    return false;
  }
};

// 画像のダウンロード（Unsplashの利用規約に従う）
export const downloadImage = async (imageUrl: string): Promise<Buffer | null> => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000 // 画像ダウンロードは30秒のタイムアウト
    });

    return Buffer.from(response.data);

  } catch (error) {
    console.error('Image download error:', error);
    return null;
  }
};
