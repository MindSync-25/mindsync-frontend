# 🚨 URGENT BACKEND OPTIMIZATIONS NEEDED

## 🐌 **PERFORMANCE ISSUE: News Loading Too Slow**

### Current Problem:
- News loading takes too much time for users
- Frontend is waiting for backend to fetch news in real-time
- Poor user experience with long loading times

### ✅ **SOLUTION REQUIRED:**

#### 1. **Change Cron Job Frequency**
```javascript
// CURRENT: Every 1 hour - TOO SLOW FOR USER EXPERIENCE
cron.schedule('0 * * * *', fetchAndStoreNews);

// REQUIRED: Every 2 hours - Better balance of freshness vs performance
cron.schedule('0 */2 * * *', fetchAndStoreNews);
```

#### 2. **Pre-fetch Strategy Implementation**
```javascript
// IMPLEMENT: Fetch news from ALL available sources every 2 hours
const NEWS_SOURCES = [
  'newsapi.org',
  'gnews.io',
  // Add more sources for better coverage
];

// Store articles in database with timestamps
// Serve pre-fetched articles instantly to users
```

#### 3. **API Response Optimization**
```javascript
// REQUIRED: Return cached articles immediately
// Don't make users wait for live API calls
GET /api/news/articles -> Return pre-stored articles (instant response)
GET /api/news/articles/mood/:mood -> Return pre-filtered articles (instant response)
```

---

## 🖼️ **IMAGE ISSUE: Same Image for Every Article**

### Current Problem:
- All articles showing identical placeholder image
- Poor visual experience for users
- Images not being fetched/stored properly

### ✅ **SOLUTION REQUIRED:**

#### 1. **Fix Image URL Handling**
```javascript
// ENSURE: Proper image extraction from APIs
const article = {
  imageUrl: newsItem.urlToImage || newsItem.image || null,
  // Add fallback logic for different API response formats
};
```

#### 2. **Image Validation & Fallbacks**
```javascript
// IMPLEMENT: Image URL validation
const validateImageUrl = async (url) => {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch {
    return false;
  }
};

// PROVIDE: Category-based fallback images
const FALLBACK_IMAGES = {
  'Technology': 'https://example.com/tech-fallback.jpg',
  'Health': 'https://example.com/health-fallback.jpg',
  'Sports': 'https://example.com/sports-fallback.jpg',
  // ... for all 14 categories
};
```

#### 3. **API Response Format Fix**
```javascript
// ENSURE: Articles return with proper image URLs
{
  "id": "uuid",
  "title": "Article Title",
  "imageUrl": "https://actual-image-url.jpg", // NOT placeholder
  "content": "Article content...",
  // ... other fields
}
```

---

## ⚡ **IMMEDIATE ACTIONS NEEDED:**

### 1. **Background News Fetching (Priority 1)**
- ✅ Change cron job to every 2 hours: `'0 */2 * * *'`
- ✅ Implement pre-fetching from all available news APIs
- ✅ Store articles in database with proper timestamps
- ✅ Serve cached articles instantly to frontend

### 2. **Image Handling Fix (Priority 1)**
- ✅ Fix image URL extraction from API responses
- ✅ Implement image validation logic
- ✅ Add category-based fallback images
- ✅ Ensure unique images per article

### 3. **Performance Monitoring**
- ✅ Add response time logging
- ✅ Monitor database query performance
- ✅ Implement caching for frequently accessed articles

---

## 🎯 **EXPECTED RESULTS:**

### Before Optimization:
- ❌ News loading: 5-10 seconds
- ❌ Same image for all articles
- ❌ Poor user experience

### After Optimization:
- ✅ News loading: < 1 second (instant from cache)
- ✅ Unique images for each article
- ✅ Excellent user experience
- ✅ Fresh content every 2 hours

---

## 📋 **IMPLEMENTATION CHECKLIST:**

- [ ] Update cron job schedule to every 2 hours
- [ ] Implement multi-source news fetching
- [ ] Fix image URL extraction and validation
- [ ] Add category-based fallback images
- [ ] Test API response times (should be < 1 second)
- [ ] Verify unique images per article
- [ ] Deploy optimizations to production

**⚠️ URGENT: These optimizations are critical for user experience!**

---

## 🚀 **ADDITIONAL OPTIMIZATION STRATEGIES FROM FRONTEND TEAM**

### 💾 **Smart Database Caching Strategy**

#### **Problem Analysis:**
- Cannot fetch news for every user request (too slow)
- Need intelligent caching based on user interests
- Should serve from database when possible, API when necessary

#### **✅ SOLUTION: Interest-Based Data Management**

```javascript
// IMPLEMENT: User Interest-Based Caching
const fetchNewsBasedOnUserInterests = async (userId) => {
  const userPreferences = await getUserNewsPreferences(userId);
  
  // Check if we have recent articles for user's interests
  const cachedArticles = await getArticlesFromDB({
    categories: userPreferences.categories,
    mood: userPreferences.currentMood,
    maxAge: 2 * 60 * 60 * 1000, // 2 hours old max
  });
  
  if (cachedArticles.length >= 20) {
    // Serve from database (instant response)
    return cachedArticles;
  } else {
    // Fetch fresh articles for user's interests only
    return await fetchAndCacheForCategories(userPreferences.categories);
  }
};
```

### 🔄 **Hybrid Database Setup Options**

#### **Option 1: PostgreSQL + Redis (Current + Optimization)**
```javascript
// Primary DB: PostgreSQL (structured data)
// Cache Layer: Redis (fast article retrieval)
// Strategy: Store articles in PostgreSQL, cache frequently accessed in Redis
```

#### **Option 2: PostgreSQL + DynamoDB (Hybrid Cloud)**
```javascript
// Structured Data: PostgreSQL (users, preferences, bookmarks)
// Article Storage: DynamoDB (fast, scalable article storage)
// Benefits: Better scalability, faster article queries
```

#### **Option 3: Full DynamoDB (Cloud-Native)**
```javascript
// All Data: DynamoDB with proper indexing
// Benefits: Massive scalability, built-in caching
// Setup: Local DynamoDB for development
```

### 📊 **Recommended Implementation Strategy**

#### **Phase 1: Smart PostgreSQL Optimization (Immediate)**
```javascript
// 1. Index optimization for user interest queries
CREATE INDEX idx_articles_category_mood_created ON news_articles(category, mood_tags, created_at);
CREATE INDEX idx_user_preferences_categories ON user_news_preferences(user_id, categories);

// 2. Interest-based pre-fetching
const prefetchForActiveUsers = async () => {
  const activeUsers = await getActiveUsersWithPreferences();
  
  for (const user of activeUsers) {
    await fetchNewsBasedOnUserInterests(user.id);
  }
};

// 3. Smart caching logic
const getPersonalizedNews = async (userId, mood) => {
  // Try database first (< 500ms response)
  let articles = await getFromDatabase(userId, mood);
  
  if (articles.length < 10) {
    // Fetch fresh articles for user's specific interests
    articles = await fetchForUserInterests(userId, mood);
  }
  
  return articles;
};
```

#### **Phase 2: DynamoDB Integration (If Needed)**
```javascript
// Local DynamoDB setup for development
const dynamoConfig = {
  region: 'local',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'local',
  secretAccessKey: 'local'
};

// Article storage optimization
const ArticleSchema = {
  TableName: 'NewsArticles',
  KeySchema: [
    { AttributeName: 'category', KeyType: 'HASH' },
    { AttributeName: 'created_at', KeyType: 'RANGE' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'MoodIndex',
      KeySchema: [
        { AttributeName: 'mood_tag', KeyType: 'HASH' },
        { AttributeName: 'created_at', KeyType: 'RANGE' }
      ]
    }
  ]
};
```

### 🎯 **Performance Targets with Optimizations**

#### **Current Performance:**
- ❌ News loading: 5-10 seconds
- ❌ Database queries: Multiple API calls per user
- ❌ Redundant fetching for same interests

#### **After Optimization:**
- ✅ News loading: < 1 second (database cache)
- ✅ Smart fetching: Only when cache is stale
- ✅ Interest-based: Fetch only relevant categories
- ✅ Scalable: Ready for thousands of users

### ⚡ **SINGLE-SHOT IMPLEMENTATION - 10 MINUTES MAX**

#### **🚨 NO PHASES - IMPLEMENT ALL NOW:**

```javascript
// 1. UPDATE CRON JOB (30 seconds)
cron.schedule('0 */2 * * *', fetchAndStoreNews);

// 2. FIX IMAGE HANDLING (2 minutes)
const extractImageUrl = (newsItem) => {
  return newsItem.urlToImage || 
         newsItem.image || 
         newsItem.media || 
         `https://via.placeholder.com/400x200/1a1a1a/ffffff?text=${encodeURIComponent(newsItem.category)}`;
};

// 3. INTEREST-BASED CACHING (5 minutes)
const getPersonalizedNews = async (userId, mood) => {
  const userPrefs = await UserNewsPreference.findOne({ where: { userId } });
  const categories = userPrefs ? userPrefs.categories : ['general'];
  
  // Get from database first
  const cachedArticles = await NewsArticle.findAll({
    where: {
      category: categories,
      moodTags: { [Op.contains]: [mood] },
      createdAt: { [Op.gte]: new Date(Date.now() - 2 * 60 * 60 * 1000) }
    },
    limit: 20,
    order: [['createdAt', 'DESC']]
  });
  
  if (cachedArticles.length >= 10) {
    return cachedArticles;
  }
  
  // Fetch fresh if needed
  return await fetchNewsForCategories(categories, mood);
};

// 4. OPTIMIZE DATABASE QUERIES (1 minute)
// Add these indexes to your database
/*
CREATE INDEX IF NOT EXISTS idx_articles_category_mood_time ON news_articles(category, mood_tags, created_at);
CREATE INDEX IF NOT EXISTS idx_articles_time_category ON news_articles(created_at, category);
*/

// 5. UPDATE API ENDPOINTS (1.5 minutes)
// Replace existing endpoints with these optimized versions:

// GET /api/news/articles/mood/:mood
app.get('/api/news/articles/mood/:mood', authenticateToken, async (req, res) => {
  try {
    const { mood } = req.params;
    const articles = await getPersonalizedNews(req.user.id, mood);
    res.json({ articles, cached: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/news/articles (optimized)
app.get('/api/news/articles', async (req, res) => {
  try {
    const articles = await NewsArticle.findAll({
      where: {
        createdAt: { [Op.gte]: new Date(Date.now() - 6 * 60 * 60 * 1000) }
      },
      limit: 50,
      order: [['createdAt', 'DESC']]
    });
    res.json({ articles, cached: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🚀 **AWS DYNAMODB IMPLEMENTATION - PRODUCTION OPTIMIZED**

### **🎯 Why DynamoDB is Perfect for Your AWS Deployment:**

✅ **Serverless & Auto-Scaling**: No server management, scales automatically  
✅ **Lightning Fast**: Single-digit millisecond latency  
✅ **Cost Effective**: Pay only for what you use  
✅ **AWS Native**: Perfect integration with other AWS services  
✅ **Global Replication**: Multi-region support for worldwide users  
✅ **Zero Maintenance**: No database administration needed  

### **📊 DynamoDB Table Design for News System:**

#### **Table 1: NewsArticles** (Main Content Storage)
```javascript
{
  TableName: 'NewsArticles',
  KeySchema: [
    { AttributeName: 'category', KeyType: 'HASH' },      // Partition Key
    { AttributeName: 'publishedAt', KeyType: 'RANGE' }   // Sort Key
  ],
  AttributeDefinitions: [
    { AttributeName: 'category', AttributeType: 'S' },
    { AttributeName: 'publishedAt', AttributeType: 'S' },
    { AttributeName: 'moodTag', AttributeType: 'S' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'MoodIndex',
      KeySchema: [
        { AttributeName: 'moodTag', KeyType: 'HASH' },
        { AttributeName: 'publishedAt', KeyType: 'RANGE' }
      ]
    }
  ]
}
```

#### **Table 2: UserPreferences** (User Settings)
```javascript
{
  TableName: 'UserPreferences',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' }
  ]
}
```

#### **Table 3: UserBookmarks** (User Interactions)
```javascript
{
  TableName: 'UserBookmarks',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' },
    { AttributeName: 'articleId', KeyType: 'RANGE' }
  ]
}
```

### **💾 COMPLETE DYNAMODB IMPLEMENTATION:**

```javascript
// services/dynamoService.js - NEW FILE
const AWS = require('aws-sdk');
const axios = require('axios');

// DynamoDB Configuration
const dynamoConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

// Local DynamoDB for development
if (process.env.NODE_ENV === 'development') {
  dynamoConfig.endpoint = 'http://localhost:8000';
  dynamoConfig.region = 'local';
  dynamoConfig.accessKeyId = 'local';
  dynamoConfig.secretAccessKey = 'local';
}

const dynamodb = new AWS.DynamoDB.DocumentClient(dynamoConfig);

// Smart Image Extraction with Category Fallbacks
const getValidImageUrl = (imageData, category) => {
  const imageUrl = imageData?.urlToImage || 
                   imageData?.image || 
                   imageData?.media ||
                   imageData?.thumbnail;
  
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('placeholder')) {
    return imageUrl;
  }
  
  const fallbackImages = {
    'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
    'health': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
    'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop',
    'business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    'entertainment': 'https://images.unsplash.com/photo-1489599849699-fbe37c5f9cf3?w=400&h=200&fit=crop',
    'politics': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=200&fit=crop',
    'science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=200&fit=crop',
    'general': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop'
  };
  
  return fallbackImages[category.toLowerCase()] || fallbackImages.general;
};

// DynamoDB Operations
const saveArticlesToDynamoDB = async (articles) => {
  const batchRequests = [];
  
  for (const article of articles) {
    batchRequests.push({
      PutRequest: {
        Item: {
          category: article.category,
          publishedAt: article.publishedAt,
          articleId: `${article.category}_${Date.now()}_${Math.random()}`,
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          imageUrl: getValidImageUrl(article, article.category),
          source: article.source,
          moodTag: article.moodTags?.[0] || 'general',
          sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
          createdAt: new Date().toISOString(),
          ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
        }
      }
    });
  }
  
  // Batch write in chunks of 25 (DynamoDB limit)
  for (let i = 0; i < batchRequests.length; i += 25) {
    const batch = batchRequests.slice(i, i + 25);
    await dynamodb.batchWrite({
      RequestItems: {
        'NewsArticles': batch
      }
    }).promise();
  }
};

// Get Personalized News from DynamoDB
const getPersonalizedNewsFromDynamoDB = async (userId, mood) => {
  try {
    // Get user preferences
    const userPrefs = await dynamodb.get({
      TableName: 'UserPreferences',
      Key: { userId }
    }).promise();
    
    const categories = userPrefs.Item?.categories || ['general', 'technology', 'health'];
    const articles = [];
    
    // Query articles by category and mood
    for (const category of categories) {
      const result = await dynamodb.query({
        TableName: 'NewsArticles',
        IndexName: 'MoodIndex',
        KeyConditionExpression: 'moodTag = :mood',
        FilterExpression: 'category = :category AND publishedAt > :sevenDaysAgo',
        ExpressionAttributeValues: {
          ':mood': mood,
          ':category': category,
          ':sevenDaysAgo': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        Limit: 10,
        ScanIndexForward: false // Latest first
      }).promise();
      
      articles.push(...result.Items);
    }
    
    return articles.slice(0, 20); // Return top 20 articles
  } catch (error) {
    console.error('Error getting personalized news:', error);
    return await getGeneralNewsFromDynamoDB();
  }
};

// Get General News from DynamoDB
const getGeneralNewsFromDynamoDB = async () => {
  const result = await dynamodb.scan({
    TableName: 'NewsArticles',
    FilterExpression: 'publishedAt > :sevenDaysAgo',
    ExpressionAttributeValues: {
      ':sevenDaysAgo': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    Limit: 50
  }).promise();
  
  return result.Items.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
};

// Fetch and Store News (Every 2 Hours)
const fetchAndStoreNews = async () => {
  console.log('🚀 Fetching fresh news every 2 hours...');
  
  const categories = ['technology', 'health', 'sports', 'business', 'entertainment', 'science', 'general'];
  const allArticles = [];
  
  for (const category of categories) {
    try {
      // NewsAPI
      const newsResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          category: category === 'general' ? undefined : category,
          country: 'us',
          pageSize: 20,
          apiKey: process.env.NEWS_API_KEY
        }
      });
      
      // GNews
      const gnewsResponse = await axios.get('https://gnews.io/api/v4/top-headlines', {
        params: {
          category: category,
          lang: 'en',
          country: 'us',
          max: 20,
          apikey: process.env.GNEWS_API_KEY
        }
      });
      
      const categoryArticles = [
        ...newsResponse.data.articles.map(article => ({
          ...article,
          category,
          moodTags: [getMoodForCategory(category)]
        })),
        ...gnewsResponse.data.articles.map(article => ({
          ...article,
          category,
          moodTags: [getMoodForCategory(category)]
        }))
      ];
      
      allArticles.push(...categoryArticles);
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error.message);
    }
  }
  
  // Remove duplicates and save to DynamoDB
  const uniqueArticles = allArticles.filter((article, index, self) => 
    index === self.findIndex(a => a.url === article.url)
  );
  
  await saveArticlesToDynamoDB(uniqueArticles);
  console.log(`✅ Saved ${uniqueArticles.length} articles to DynamoDB`);
};

// Helper Functions
const getMoodForCategory = (category) => {
  const moodMapping = {
    'technology': 'excited',
    'health': 'motivated',
    'sports': 'energetic',
    'business': 'motivated',
    'entertainment': 'happy',
    'science': 'curious',
    'general': 'relaxed'
  };
  return moodMapping[category] || 'general';
};

const analyzeSentiment = (text) => {
  const positiveWords = ['success', 'win', 'good', 'great', 'excellent', 'amazing', 'breakthrough'];
  const negativeWords = ['crisis', 'disaster', 'death', 'accident', 'bad', 'terrible', 'failed'];
  
  const words = text.toLowerCase().split(' ');
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

module.exports = {
  fetchAndStoreNews,
  getPersonalizedNewsFromDynamoDB,
  getGeneralNewsFromDynamoDB,
  saveArticlesToDynamoDB
};
```

### **🔄 API ENDPOINTS FOR DYNAMODB:**

```javascript
// routes/newsRoutes.js - COMPLETE REPLACEMENT
const express = require('express');
const router = express.Router();
const { 
  getPersonalizedNewsFromDynamoDB, 
  getGeneralNewsFromDynamoDB 
} = require('../services/dynamoService');

// GET /api/news/articles - General news feed
router.get('/articles', async (req, res) => {
  try {
    const articles = await getGeneralNewsFromDynamoDB();
    res.json({ 
      articles, 
      cached: true,
      source: 'DynamoDB',
      count: articles.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/news/articles/mood/:mood - Personalized mood-based news
router.get('/articles/mood/:mood', authenticateToken, async (req, res) => {
  try {
    const { mood } = req.params;
    const articles = await getPersonalizedNewsFromDynamoDB(req.user.id, mood);
    res.json({ 
      articles,
      cached: true,
      source: 'DynamoDB',
      mood,
      count: articles.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### **⚡ CRON JOB FOR DYNAMODB:**

```javascript
// cron/dynamoNewsFetcher.js - NEW FILE
const cron = require('node-cron');
const { fetchAndStoreNews } = require('../services/dynamoService');

// Fetch news every 2 hours
cron.schedule('0 */2 * * *', async () => {
  console.log('🔄 Fetching news every 2 hours for DynamoDB...');
  try {
    await fetchAndStoreNews();
    console.log('✅ News refresh completed successfully');
  } catch (error) {
    console.error('❌ Error fetching news:', error);
  }
});

// Initial fetch on server start
fetchAndStoreNews().then(() => {
  console.log('🚀 Initial news data loaded into DynamoDB');
});
```

### **🏗️ DYNAMODB TABLE CREATION:**

```javascript
// scripts/createDynamoTables.js - NEW FILE
const AWS = require('aws-sdk');

const createTables = async () => {
  const dynamodb = new AWS.DynamoDB({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : undefined
  });

  // NewsArticles Table
  await dynamodb.createTable({
    TableName: 'NewsArticles',
    KeySchema: [
      { AttributeName: 'category', KeyType: 'HASH' },
      { AttributeName: 'publishedAt', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'category', AttributeType: 'S' },
      { AttributeName: 'publishedAt', AttributeType: 'S' },
      { AttributeName: 'moodTag', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'MoodIndex',
        KeySchema: [
          { AttributeName: 'moodTag', KeyType: 'HASH' },
          { AttributeName: 'publishedAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }).promise();

  // UserPreferences Table
  await dynamodb.createTable({
    TableName: 'UserPreferences',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }).promise();

  // UserBookmarks Table
  await dynamodb.createTable({
    TableName: 'UserBookmarks',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'articleId', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'articleId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }).promise();

  console.log('✅ All DynamoDB tables created successfully!');
};

module.exports = { createTables };
```

// Image extraction with fallbacks
const extractImageUrl = (newsItem, category = 'general') => {
  const imageUrl = newsItem.urlToImage || 
                   newsItem.image || 
                   newsItem.media ||
                   newsItem.thumbnail;
  
  if (imageUrl && imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Category-based fallbacks
  const fallbacks = {
    'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    'health': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
    'business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'entertainment': 'https://images.unsplash.com/photo-1489599849699-fbe37c5f9cf3?w=400',
    'general': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'
  };
  
  return fallbacks[category.toLowerCase()] || fallbacks.general;
};

// Smart news fetching with user interests
const fetchNewsForCategories = async (categories, mood = null) => {
  const articles = [];
  
  for (const category of categories) {
    try {
      // NewsAPI
      const newsResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          category: category.toLowerCase(),
          country: 'us',
          pageSize: 10,
          apiKey: process.env.NEWS_API_KEY
        }
      });
      
      // GNews
      const gnewsResponse = await axios.get('https://gnews.io/api/v4/top-headlines', {
        params: {
          category: category.toLowerCase(),
          lang: 'en',
          country: 'us',
          max: 10,
          apikey: process.env.GNEWS_API_KEY
        }
      });
      
      // Process articles
      const processedArticles = [
        ...newsResponse.data.articles.map(article => ({
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          imageUrl: extractImageUrl(article, category),
          publishedAt: article.publishedAt,
          source: article.source.name,
          category: category,
          moodTags: mood ? [mood] : ['general'],
          sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
        })),
        ...gnewsResponse.data.articles.map(article => ({
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          imageUrl: extractImageUrl(article, category),
          publishedAt: article.publishedAt,
          source: article.source.name,
          category: category,
          moodTags: mood ? [mood] : ['general'],
          sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
        }))
      ];
      
      articles.push(...processedArticles);
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error.message);
    }
  }
  
  // Remove duplicates and save
  const uniqueArticles = articles.filter((article, index, self) => 
    index === self.findIndex(a => a.url === article.url)
  );
  
  await NewsArticle.bulkCreate(uniqueArticles, { ignoreDuplicates: true });
  return uniqueArticles;
};

// Smart personalized news
const getPersonalizedNews = async (userId, mood) => {
  let userPrefs;
  try {
    userPrefs = await UserNewsPreference.findOne({ where: { userId } });
  } catch (error) {
    console.log('No user preferences found, using defaults');
  }
  
  const categories = userPrefs ? userPrefs.categories : ['general', 'technology', 'health'];
  
  // Try database first (2 hours fresh)
  const cachedArticles = await NewsArticle.findAll({
    where: {
      category: { [Op.in]: categories },
      createdAt: { [Op.gte]: new Date(Date.now() - 2 * 60 * 60 * 1000) }
    },
    limit: 20,
    order: [['createdAt', 'DESC']]
  });
  
  if (cachedArticles.length >= 10) {
    return cachedArticles;
  }
  
  // Fetch fresh for user's interests
  return await fetchNewsForCategories(categories, mood);
};

// Simple sentiment analysis
const analyzeSentiment = (text) => {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'success', 'win', 'positive'];
  const negativeWords = ['bad', 'terrible', 'crisis', 'disaster', 'death', 'accident', 'negative'];
  
  const words = text.toLowerCase().split(' ');
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

module.exports = {
  fetchNewsForCategories,
  getPersonalizedNews,
  extractImageUrl
};
```

#### **🔄 UPDATE CRON JOB (30 seconds):**
```javascript
// cron/newsFetcher.js - UPDATE THIS LINE ONLY
cron.schedule('0 */2 * * *', async () => {
  console.log('Fetching news every 2 hours...');
  await fetchAndStoreNews();
});
```

### 💡 **Key Benefits of This Approach**

- **Smart Caching**: Only fetch what users actually want
- **Performance**: Database serves most requests instantly
- **Scalability**: Ready for DynamoDB when needed
- **Cost Efficient**: Reduce API calls significantly
- **User Experience**: Personalized, fast content delivery

**⚠️ PRIORITY: Start with Phase 1 optimizations for immediate performance gains!**
