import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { NEWS_CATEGORIES, NewsCategory, DEFAULT_CATEGORIES } from '../constants/newsCategories';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
  NewsOnboarding: undefined;
};

interface NewsInterestsOnboardingScreenProps {}

const NewsInterestsOnboardingScreen: React.FC<NewsInterestsOnboardingScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#fff' : '#000',
      padding: 20,
    },
    header: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#f5f5f5',
      textAlign: 'center',
      marginTop: 40,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 22,
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 30,
    },
    categoryCard: {
      width: '45%',
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#1a1a1a',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme === 'light' ? '#f8f9fa' : '#1a1a1a',
      minHeight: 120,
      justifyContent: 'center',
    },
    selectedCard: {
      backgroundColor: theme === 'light' ? '#e3f2fd' : '#1e3a8a',
      borderColor: theme === 'light' ? '#1976d2' : '#3b82f6',
    },
    categoryIcon: {
      marginBottom: 8,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme === 'light' ? '#000' : '#f5f5f5',
      textAlign: 'center',
      marginBottom: 4,
    },
    categoryDescription: {
      fontSize: 11,
      color: theme === 'light' ? '#666' : '#aaa',
      textAlign: 'center',
      lineHeight: 14,
    },
    selectedCount: {
      fontSize: 16,
      color: theme === 'light' ? '#1976d2' : '#3b82f6',
      textAlign: 'center',
      marginBottom: 20,
      fontWeight: '500',
    },
    continueButton: {
      backgroundColor: theme === 'light' ? '#1976d2' : '#3b82f6',
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 25,
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 20,
    },
    continueButtonDisabled: {
      backgroundColor: theme === 'light' ? '#ccc' : '#444',
    },
    continueButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    skipButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    skipButtonText: {
      color: theme === 'light' ? '#666' : '#aaa',
      fontSize: 16,
    },
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedCategories.length < 3) {
      Alert.alert(
        'Select More Interests',
        'Please select at least 3 categories to get personalized news recommendations.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // Store user's news preferences
      const newsPreferences = {
        interests: selectedCategories,
        setupComplete: true,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('newsPreferences', JSON.stringify(newsPreferences));
      await AsyncStorage.setItem('newsOnboardingComplete', 'true');
      await AsyncStorage.setItem('newsPermissionGranted', 'true'); // Grant news permission
      
      // Navigate to home or news screen
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving news preferences:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('newsOnboardingComplete', 'true');
      await AsyncStorage.setItem('newsPermissionGranted', 'true'); // Grant permission even when skipping
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error marking onboarding as complete:', error);
      navigation.navigate('Home');
    }
  };

  return (
    <ScrollView style={dynamicStyles.container} showsVerticalScrollIndicator={false}>
      <Text style={dynamicStyles.header}>What interests you?</Text>
      <Text style={dynamicStyles.subtitle}>
        Choose your favorite topics to get personalized news recommendations that match your mood and interests.
      </Text>

      <Text style={dynamicStyles.selectedCount}>
        {selectedCategories.length} of {NEWS_CATEGORIES.length} selected
        {selectedCategories.length >= 3 ? ' ✓' : ' (minimum 3)'}
      </Text>

      <View style={dynamicStyles.categoriesContainer}>
        {NEWS_CATEGORIES.map((category: NewsCategory) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                dynamicStyles.categoryCard,
                isSelected && dynamicStyles.selectedCard
              ]}
              onPress={() => toggleCategory(category.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={32}
                color={
                  isSelected
                    ? (theme === 'light' ? '#1976d2' : '#3b82f6')
                    : (theme === 'light' ? '#666' : '#aaa')
                }
                style={dynamicStyles.categoryIcon}
              />
              <Text style={dynamicStyles.categoryLabel}>{category.label}</Text>
              <Text style={dynamicStyles.categoryDescription}>
                {category.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          dynamicStyles.continueButton,
          selectedCategories.length < 3 && dynamicStyles.continueButtonDisabled
        ]}
        onPress={handleContinue}
        disabled={selectedCategories.length < 3 || isLoading}
        activeOpacity={0.8}
      >
        <Text style={dynamicStyles.continueButtonText}>
          {isLoading ? 'Setting up...' : 'Continue'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={dynamicStyles.skipButton} onPress={handleSkip}>
        <Text style={dynamicStyles.skipButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default NewsInterestsOnboardingScreen;
