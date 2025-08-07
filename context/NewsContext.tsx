import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NEWS_CATEGORIES, NewsCategory, MOOD_CATEGORY_MAPPING, DEFAULT_CATEGORIES } from '../constants/newsCategories';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  imageUrl?: string;
  source: string;
  category: string;
  publishedAt: string;
  moodTags: string[];
  isLocal: boolean;
  readTime: string;
  isBookmarked?: boolean;
}

export interface NewsPreferences {
  interests: string[];
  location?: string;
  moodPreferences?: Record<string, string[]>;
  notificationSettings?: {
    breakingNews: boolean;
    dailyDigest: boolean;
    localEvents: boolean;
    timeOfDay: string;
  };
  setupComplete: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface NewsContextType {
  // Preferences
  preferences: NewsPreferences | null;
  updatePreferences: (newPreferences: Partial<NewsPreferences>) => Promise<void>;
  
  // News Feed
  newsArticles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Feed Management
  loadPersonalizedNews: (mood?: string, refresh?: boolean) => Promise<void>;
  loadTrendingNews: () => Promise<void>;
  loadLocalNews: () => Promise<void>;
  
  // User Interactions
  markAsRead: (articleId: string, mood?: string) => Promise<void>;
  toggleBookmark: (articleId: string) => Promise<void>;
  skipArticle: (articleId: string, mood?: string) => Promise<void>;
  
  // Bookmarks
  bookmarkedArticles: NewsArticle[];
  loadBookmarks: () => Promise<void>;
  
  // Setup
  isOnboardingComplete: boolean;
  completeOnboarding: (interests: string[]) => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

interface NewsProviderProps {
  children: ReactNode;
}

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<NewsPreferences | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Load preferences on app start
  useEffect(() => {
    loadUserPreferences();
    loadCachedNews().then(cached => {
      if (cached.length > 0) {
        setNewsArticles(cached);
      }
    }); // Load previously saved news
  }, []);

  // Auto-load personalized news when preferences are loaded
  useEffect(() => {
    if (preferences && preferences.setupComplete && newsArticles.length === 0 && !isLoading) {
      loadPersonalizedNews(undefined, false); // No mood, just user interests
    }
  }, [preferences]);

  const loadCachedNews = async (): Promise<NewsArticle[]> => {
    try {
      const cachedNews = await AsyncStorage.getItem('cachedNewsArticles');
      if (cachedNews) {
        const articles: NewsArticle[] = JSON.parse(cachedNews);
        // Only return cached articles if they're not too old (24 hours)
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const freshArticles = articles.filter(article => 
          new Date(article.publishedAt).getTime() > dayAgo
        );
        return freshArticles;
      }
      return [];
    } catch (error) {
      console.error('Error loading cached news:', error);
      return [];
    }
  };

  const saveCachedNews = async (articles: NewsArticle[]) => {
    try {
      await AsyncStorage.setItem('cachedNewsArticles', JSON.stringify(articles));
    } catch (error) {
      console.error('Error saving cached news:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const storedPreferences = await AsyncStorage.getItem('newsPreferences');
      if (storedPreferences) {
        const prefs = JSON.parse(storedPreferences);
        setPreferences(prefs);
        setIsOnboardingComplete(prefs.setupComplete || false);
      } else {
        // Set default preferences
        const defaultPrefs: NewsPreferences = {
          interests: DEFAULT_CATEGORIES,
          setupComplete: false,
          createdAt: new Date().toISOString(),
          notificationSettings: {
            breakingNews: true,
            dailyDigest: true,
            localEvents: true,
            timeOfDay: '09:00',
          },
        };
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading news preferences:', error);
      setError('Failed to load preferences');
    }
  };

  const updatePreferences = async (newPreferences: Partial<NewsPreferences>) => {
    try {
      const updatedPrefs = {
        ...preferences,
        ...newPreferences,
        updatedAt: new Date().toISOString(),
      } as NewsPreferences;

      await AsyncStorage.setItem('newsPreferences', JSON.stringify(updatedPrefs));
      setPreferences(updatedPrefs);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const completeOnboarding = async (interests: string[]) => {
    try {
      const updatedPrefs: NewsPreferences = {
        ...preferences,
        interests,
        setupComplete: true,
        updatedAt: new Date().toISOString(),
      } as NewsPreferences;

      await AsyncStorage.setItem('newsPreferences', JSON.stringify(updatedPrefs));
      setPreferences(updatedPrefs);
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const loadPersonalizedNews = async (mood?: string, refresh = false) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try to load cached news first (for instant display)
      if (!refresh) {
        const cached = await loadCachedNews();
        if (cached.length > 0) {
          setNewsArticles(cached);
          setIsLoading(false);
          // Continue loading fresh data in background
        }
      }

      // Get user interests (ignore mood for now as requested)
      const userInterests = preferences?.interests || [];
      const hasInterests = userInterests.length > 0;

      // 🔥 PROPER API CALL TO RAILWAY BACKEND WITH DB INTEGRATION!
      const RAILWAY_API_URL = 'https://mindsync-core-api-production.up.railway.app';
      console.log('🚀 Loading news from Railway backend DB...', { userInterests, hasInterests });
      
      // Build API endpoint based on user preferences
      let apiEndpoint = `${RAILWAY_API_URL}/api/news`;
      if (hasInterests) {
        // If user has interests, filter by them
        apiEndpoint += `?categories=${userInterests.join(',')}`;
      }
      // If no interests, get all news (no query params needed)
      
      console.log('📡 Calling API:', apiEndpoint);

      try {
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // Add user token if available for personalization
            ...(await AsyncStorage.getItem('userToken') && {
              'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
            })
          }
        });
        
        if (!response.ok) {
          console.log(`⚠️ Railway API returned ${response.status}, using fallback...`);
          throw new Error(`Railway API error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Backend DB response:', data);
        
        // Process backend articles from your database
        const backendArticles: NewsArticle[] = (data.articles || data.news || data || []).map((article: any) => ({
          id: article.id || article._id || Math.random().toString(),
          title: article.title,
          description: article.description || article.summary || article.content?.substring(0, 150) + '...',
          content: article.content || article.body,
          url: article.url || article.link,
          imageUrl: article.imageUrl || article.image || article.urlToImage,
          source: article.source?.name || article.source || 'News Source',
          category: article.category,
          publishedAt: article.publishedAt || article.createdAt || new Date().toISOString(),
          readTime: article.readTime || '3 min read',
          moodTags: article.moodTags || ['informative'],
          isLocal: article.isLocal || false,
          isBookmarked: false,
        }));

        console.log('📰 Processed DB articles:', backendArticles.length);

        // If backend articles exist, use them
        if (backendArticles.length > 0) {
          if (refresh) {
            setNewsArticles(backendArticles);
            await saveCachedNews(backendArticles);
          } else {
            // For non-refresh, replace current articles with fresh DB data
            setNewsArticles(backendArticles);
            await saveCachedNews(backendArticles);
          }
          setHasMore(backendArticles.length >= 10); // Assume more if we got 10+
          setError(null); // Clear any previous errors
          return; // Success - exit early
        } else {
          console.log('⚠️ No articles returned from backend DB');
          throw new Error('No articles found in database');
        }
        
      } catch (backendError) {
        console.log('⚠️ Backend DB not available yet, using high-quality fallback:', backendError);
        
        // Create smart fallback based on user interests
        const fallbackCategories = hasInterests ? userInterests : DEFAULT_CATEGORIES;
        const fallbackArticles = generateMockNews(fallbackCategories, 'user-interests');
        
        if (refresh) {
          setNewsArticles(fallbackArticles);
          await saveCachedNews(fallbackArticles);
        } else {
          setNewsArticles(fallbackArticles);
          await saveCachedNews(fallbackArticles);
        }
        
        setError('Using offline news. Backend database will be available soon.');
        setHasMore(true);
      }

    } catch (error) {
      console.error('❌ Error in loadPersonalizedNews:', error);
      
      // Always provide fallback content instead of showing error state
      console.log('🔄 Main error fallback - providing backup news...');
      const emergencyFallbackArticles = generateMockNews(DEFAULT_CATEGORIES, 'emergency-fallback');
      setNewsArticles(emergencyFallbackArticles);
      await saveCachedNews(emergencyFallbackArticles);
      
      // Set a user-friendly message instead of technical error
      setError('Using offline news. Check connection for latest updates.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock trending news - replace with actual API
      const trendingArticles = generateMockNews(['technology', 'business', 'world'], 'trending');
      setNewsArticles(trendingArticles);
    } catch (error) {
      console.error('Error loading trending news:', error);
      setError('Failed to load trending news');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalNews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock local news - replace with actual API
      const localArticles = generateMockNews(['local'], 'local');
      setNewsArticles(localArticles);
    } catch (error) {
      console.error('Error loading local news:', error);
      setError('Failed to load local news');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (articleId: string, mood?: string) => {
    try {
      // Track reading behavior for personalization
      const readingData = {
        articleId,
        action: 'read',
        mood,
        timestamp: new Date().toISOString(),
      };
      
      // Store locally for now (replace with API call)
      const existingData = await AsyncStorage.getItem('readingHistory') || '[]';
      const history = JSON.parse(existingData);
      history.push(readingData);
      await AsyncStorage.setItem('readingHistory', JSON.stringify(history.slice(-100))); // Keep last 100
    } catch (error) {
      console.error('Error marking article as read:', error);
    }
  };

  const toggleBookmark = async (articleId: string) => {
    try {
      const bookmarks = await AsyncStorage.getItem('newsBookmarks') || '[]';
      let bookmarkList: string[] = JSON.parse(bookmarks);
      
      if (bookmarkList.includes(articleId)) {
        bookmarkList = bookmarkList.filter(id => id !== articleId);
      } else {
        bookmarkList.push(articleId);
      }
      
      await AsyncStorage.setItem('newsBookmarks', JSON.stringify(bookmarkList));
      
      // Update articles state
      setNewsArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, isBookmarked: !article.isBookmarked }
          : article
      ));
      
      // Reload bookmarks
      await loadBookmarks();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const skipArticle = async (articleId: string, mood?: string) => {
    try {
      // Track skipping behavior
      const skipData = {
        articleId,
        action: 'skip',
        mood,
        timestamp: new Date().toISOString(),
      };
      
      const existingData = await AsyncStorage.getItem('readingHistory') || '[]';
      const history = JSON.parse(existingData);
      history.push(skipData);
      await AsyncStorage.setItem('readingHistory', JSON.stringify(history.slice(-100)));
    } catch (error) {
      console.error('Error tracking skip:', error);
    }
  };

  const loadBookmarks = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem('newsBookmarks') || '[]';
      const bookmarkIds: string[] = JSON.parse(bookmarks);
      
      // Filter bookmarked articles from current articles
      const bookmarked = newsArticles.filter(article => bookmarkIds.includes(article.id));
      setBookmarkedArticles(bookmarked);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const value: NewsContextType = {
    preferences,
    updatePreferences,
    newsArticles,
    isLoading,
    error,
    hasMore,
    loadPersonalizedNews,
    loadTrendingNews,
    loadLocalNews,
    markAsRead,
    toggleBookmark,
    skipArticle,
    bookmarkedArticles,
    loadBookmarks,
    isOnboardingComplete,
    completeOnboarding,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

// Mock data generator (replace with actual API calls)
function generateMockNews(categories: string[], context?: string): NewsArticle[] {
  const mockTitles = {
    technology: [
      'Revolutionary AI breakthrough changes everything',
      'New smartphone features you didn\'t know you needed',
      'The future of coding is here',
      'Breakthrough in quantum computing achieved',
    ],
    business: [
      'Stock market reaches new heights',
      'Startup raises $100M in funding',
      'Economic outlook for next quarter',
      'New business trends emerging',
    ],
    health: [
      'Simple habit that improves mental health',
      'Latest research on nutrition and longevity',
      'Exercise routine that takes only 10 minutes',
      'Breakthrough in medical treatment',
    ],
    sports: [
      'Incredible comeback in last night\'s game',
      'Rising star breaks long-standing record',
      'Championship predictions for this season',
      'Unexpected trade shakes up the league',
    ],
    entertainment: [
      'Must-watch movies coming this month',
      'Behind the scenes of latest blockbuster',
      'Celebrity reveals surprising hobby',
      'Streaming platform announces new series',
    ],
    local: [
      'New restaurant opens downtown',
      'City announces infrastructure improvements',
      'Local festival this weekend',
      'School district receives major funding',
    ],
  };

  const articles: NewsArticle[] = [];
  categories.forEach(category => {
    const titles = mockTitles[category as keyof typeof mockTitles] || mockTitles.technology;
    
    // Real news URLs for better read more functionality
    const realUrls = {
      technology: [
        'https://techcrunch.com',
        'https://www.theverge.com',
        'https://arstechnica.com',
        'https://www.wired.com',
      ],
      business: [
        'https://www.bloomberg.com',
        'https://www.reuters.com/business',
        'https://www.cnbc.com',
        'https://www.wsj.com',
      ],
      health: [
        'https://www.healthline.com',
        'https://www.mayoclinic.org',
        'https://www.webmd.com',
        'https://www.medicalnewstoday.com',
      ],
      sports: [
        'https://www.espn.com',
        'https://www.sportscenter.com',
        'https://www.nbc.com/nbc-sports',
        'https://www.cbssports.com',
      ],
      entertainment: [
        'https://variety.com',
        'https://www.hollywoodreporter.com',
        'https://entertainment.com',
        'https://www.tmz.com',
      ],
      local: [
        'https://www.localnews.com',
        'https://www.abc7news.com',
        'https://www.local10.com',
        'https://www.news12.com',
      ],
    };

    titles.forEach((title, index) => {
      const articleId = `${category}-${index}-${Date.now()}-${Math.random()}`;
      const categoryUrls = realUrls[category as keyof typeof realUrls] || realUrls.technology;
      
      articles.push({
        id: articleId,
        title,
        description: `Engaging summary of this ${category} story that will make you want to read more...`,
        url: categoryUrls[index % categoryUrls.length], // Cycle through real URLs
        imageUrl: `https://picsum.photos/400/250?random=${articleId}`, // Unique image per article
        source: category === 'local' ? 'Local News' : `${category.charAt(0).toUpperCase() + category.slice(1)} Daily`,
        category,
        publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        moodTags: NEWS_CATEGORIES.find(cat => cat.id === category)?.moodTags || ['informative'],
        isLocal: category === 'local',
        readTime: `${Math.floor(Math.random() * 5) + 2} min`,
        isBookmarked: false,
      });
    });
  });

  return articles.slice(0, 10); // Return max 10 articles
}
