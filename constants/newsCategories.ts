export interface NewsCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  moodTags: string[];
  subcategories?: string[];
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  {
    id: 'technology',
    label: 'Technology',
    icon: 'laptop',
    description: 'Latest tech news, gadgets, and innovations',
    moodTags: ['exciting', 'innovative', 'informative'],
    subcategories: ['AI & ML', 'Smartphones', 'Software', 'Startups', 'Cybersecurity']
  },
  {
    id: 'business',
    label: 'Business',
    icon: 'briefcase',
    description: 'Markets, finance, and business insights',
    moodTags: ['informative', 'serious', 'analytical'],
    subcategories: ['Stock Market', 'Economy', 'Entrepreneurship', 'Corporate', 'Cryptocurrency']
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    icon: 'heart-pulse',
    description: 'Health tips, medical breakthroughs, and wellness',
    moodTags: ['positive', 'helpful', 'informative'],
    subcategories: ['Fitness', 'Nutrition', 'Mental Health', 'Medical Research', 'Lifestyle']
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: 'soccer',
    description: 'Sports news, scores, and athlete updates',
    moodTags: ['exciting', 'competitive', 'energetic'],
    subcategories: ['Football', 'Basketball', 'Soccer', 'Tennis', 'Olympics', 'Esports']
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: 'movie-open',
    description: 'Movies, TV shows, celebrity news, and pop culture',
    moodTags: ['fun', 'exciting', 'entertaining'],
    subcategories: ['Movies', 'TV Shows', 'Music', 'Celebrity', 'Gaming', 'Streaming']
  },
  {
    id: 'science',
    label: 'Science',
    icon: 'flask',
    description: 'Scientific discoveries and research',
    moodTags: ['fascinating', 'educational', 'innovative'],
    subcategories: ['Space', 'Climate', 'Biology', 'Physics', 'Research', 'Environment']
  },
  {
    id: 'politics',
    label: 'Politics',
    icon: 'bank',
    description: 'Political news and government updates',
    moodTags: ['serious', 'important', 'informative'],
    subcategories: ['Elections', 'Policy', 'International', 'Local Government', 'Law']
  },
  {
    id: 'world',
    label: 'World News',
    icon: 'earth',
    description: 'International news and global events',
    moodTags: ['important', 'serious', 'global'],
    subcategories: ['International', 'Conflicts', 'Diplomacy', 'Culture', 'Human Rights']
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    icon: 'home-heart',
    description: 'Fashion, travel, food, and personal interests',
    moodTags: ['inspiring', 'fun', 'relaxing'],
    subcategories: ['Fashion', 'Travel', 'Food', 'Home', 'Relationships', 'Hobbies']
  },
  {
    id: 'education',
    label: 'Education',
    icon: 'school',
    description: 'Learning resources and educational news',
    moodTags: ['educational', 'inspiring', 'helpful'],
    subcategories: ['Universities', 'Online Learning', 'Skills', 'Career', 'Students']
  },
  {
    id: 'automotive',
    label: 'Automotive',
    icon: 'car-sports',
    description: 'Cars, vehicles, and transportation news',
    moodTags: ['exciting', 'innovative', 'technical'],
    subcategories: ['Electric Vehicles', 'Reviews', 'Industry', 'Racing', 'Technology']
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: 'leaf',
    description: 'Climate change, sustainability, and nature',
    moodTags: ['important', 'serious', 'hopeful'],
    subcategories: ['Climate Change', 'Sustainability', 'Wildlife', 'Conservation', 'Renewable Energy']
  },
  {
    id: 'local',
    label: 'Local News',
    icon: 'map-marker',
    description: 'News and events from your area',
    moodTags: ['relevant', 'community', 'local'],
    subcategories: ['City Events', 'Local Business', 'Community', 'Traffic', 'Weather']
  },
  {
    id: 'startups',
    label: 'Startups',
    icon: 'rocket-launch',
    description: 'Startup news, funding, and entrepreneurship',
    moodTags: ['inspiring', 'innovative', 'motivating'],
    subcategories: ['Funding', 'New Companies', 'Unicorns', 'Founders', 'Innovation']
  }
];

// Mood-based category mapping for personalized news
export const MOOD_CATEGORY_MAPPING = {
  happy: ['entertainment', 'sports', 'lifestyle', 'technology', 'startups'],
  sad: ['health', 'science', 'education', 'environment', 'lifestyle'],
  excited: ['technology', 'sports', 'entertainment', 'startups', 'automotive'],
  stressed: ['health', 'education', 'environment', 'lifestyle', 'science'],
  motivated: ['business', 'startups', 'education', 'technology', 'health'],
  curious: ['science', 'technology', 'education', 'world', 'environment'],
  relaxed: ['lifestyle', 'entertainment', 'health', 'local', 'travel']
};

// Default categories for new users
export const DEFAULT_CATEGORIES = ['technology', 'health', 'local', 'entertainment'];
