// src/screens/DashboardScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Profile: undefined;
};
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // === Sample / placeholder data ===
  const tasksDue = 3;
  const remindersCount = 1;
  const meetingTime = '4:00 PM';
  const toDoList = ['Finish project report', 'Call Sarah at 3 PM'];
  const notesList = ['Plan vacation', 'Research destinations and flights'];
  const remindersList = ["Doctor’s appointment — Tomorrow, 9:00 AM"];
  const weather = { temperature: 72, condition: 'Sunny' };
  const suggestedActions = ['Start Focus Timer', 'View Daily Summary', 'Clear Emails'];
  const moodIcons: Array<keyof typeof MaterialCommunityIcons.glyphMap> = [
    'emoticon-happy-outline',
    'emoticon-neutral-outline',
    'emoticon-sad-outline'
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centeredContent}>

          {/* Header */}
          <View style={[styles.header, styles.maxCardWidth]}>
            <Text style={styles.greeting}>Hello!</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <MaterialCommunityIcons name="account-circle" size={28} color="#f5f5f5" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, styles.maxCardWidth]}>
            <MaterialCommunityIcons name="magnify" size={20} color="#888" />
            <TextInput
              placeholder="Tap to search"
              placeholderTextColor="#888"
              style={styles.searchInput}
            />
          </View>

          {/* Today’s Overview */}
          <View style={[styles.card, styles.maxCardWidth]}>
            <Text style={styles.cardTitle}>Today’s overview</Text>
            <View style={styles.overviewRow}>
              <MaterialCommunityIcons name="playlist-check" size={20} color="#f5f5f5" />
              <Text style={styles.overviewText}>{`${tasksDue} tasks due`}</Text>

              <MaterialCommunityIcons
                name="bell-outline"
                size={20}
                color="#f5f5f5"
                style={{ marginLeft: 24 }}
              />
              <Text style={styles.overviewText}>{`${remindersCount} reminder`}</Text>

              <View style={{ flex: 1 }} />

              <Text style={styles.overviewText}>Meeting at {meetingTime}</Text>
            </View>
          </View>

          {/* 2×2 Grid */}
          <View style={[styles.grid, styles.maxCardWidth]}>
            {/* To-Do List */}
            <TouchableOpacity style={[styles.card, styles.gridItem]} onPress={() => navigation.navigate('ComingSoon')} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>To-Do List</Text>
              {toDoList.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <MaterialCommunityIcons name="checkbox-blank-outline" size={18} color="#f5f5f5" />
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
            </TouchableOpacity>

            {/* Notes */}
            <TouchableOpacity style={[styles.card, styles.gridItem]} onPress={() => navigation.navigate('ComingSoon')} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>Notes</Text>
              {notesList.map((item, i) => (
                <Text key={i} style={styles.listItemText}>{item}</Text>
              ))}
            </TouchableOpacity>

            {/* Reminders */}
            <TouchableOpacity style={[styles.card, styles.gridItem]} onPress={() => navigation.navigate('ComingSoon')} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>Reminders</Text>
              {remindersList.map((item, i) => (
                <Text key={i} style={styles.listItemText}>{item}</Text>
              ))}
            </TouchableOpacity>

            {/* Weather */}
            <TouchableOpacity style={[styles.card, styles.gridItem]} onPress={() => navigation.navigate('ComingSoon')} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>Weather</Text>
              <View style={styles.overviewRow}>
                <View style={styles.weatherCircle} />
                <Text style={styles.weatherText}>{`${weather.temperature}°`}</Text>
              </View>
              <Text style={styles.listItemText}>{weather.condition}</Text>
            </TouchableOpacity>
          </View>

          {/* Suggested Actions & Mood (side by side on web, stacked on mobile) */}
          <View style={[styles.suggestedMoodRow, styles.maxCardWidth]}>
            <View style={[styles.card, styles.suggestedCard]}>
              <Text style={styles.cardTitle}>Suggested actions</Text>
              {suggestedActions.map((action, i) => (
                <TouchableOpacity key={i} style={styles.actionButton} onPress={() => navigation.navigate('ComingSoon')}>
                  <Text style={styles.actionButtonText}>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.card, styles.moodCard]}>
              <Text style={styles.cardTitle}>How are you feeling today?</Text>
              <View style={styles.moodRow}>
                {moodIcons.map((icon, i) => (
                  <TouchableOpacity key={i} style={styles.moodButton} onPress={() => navigation.navigate('ComingSoon')}>
                    <MaterialCommunityIcons name={icon} size={28} color="#f5f5f5" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          {/* ...existing code... */}
        </View>
      </ScrollView>

      {/* Fixed Bottom “Ask me anything…” bar */}
      <View style={styles.fixedBottomBarContainer}>
        <View style={[styles.bottomBar, styles.maxCardWidth]}>
          <TextInput
            placeholder="Ask me anything..."
            placeholderTextColor="#888"
            editable={false}
            style={styles.bottomInput}
          />
          <TouchableOpacity style={styles.micButton} onPress={() => {/* voice command handler */}}>
            <MaterialCommunityIcons name="microphone-outline" size={28} color="#f5f5f5" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: Platform.select({
    web: {
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
      overflow: 'hidden',
    },
    default: {
      flex: 1,
      backgroundColor: '#000',
      alignItems: 'center',
    },
  }),
  scrollContent: { padding: 16, paddingBottom: 100, alignItems: 'center' },

  fullScroll: Platform.select({
    web: {
      width: '100vw',
      minHeight: '100vh',
      flex: 1,
      backgroundColor: '#000',
    },
    default: {
      flex: 1,
      backgroundColor: '#000',
    },
  }),

  // Removed bottomBarContainer, not needed

  centeredContent: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 900,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 0,
  },
  greeting: { fontSize: 32, color: '#f5f5f5' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  searchInput: { flex: 1, marginLeft: 8, color: '#f5f5f5', fontSize: 16 },

  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  maxCardWidth: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  cardTitle: { fontSize: 18, color: '#f5f5f5', marginBottom: 8 },

  overviewRow: { flexDirection: 'row', alignItems: 'center' },
  overviewText: { color: '#f5f5f5', marginLeft: 8, fontSize: 16 },

  grid: Platform.select({
    web: {
      flexDirection: width > 700 ? 'row' : 'column',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 900,
      alignSelf: 'center',
    },
    default: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 900,
      alignSelf: 'center',
      marginTop: 0,
    },
  }),
  gridItem: Platform.select({
    web: {
      width: width > 700 ? (width - 64) / 2 : '100%',
      minWidth: 260,
      marginBottom: 16,
      alignSelf: 'center',
    },
    default: {
      width: '47%',
      marginBottom: 16,
      alignSelf: 'center',
    },
  }),
  gridItemLeft: Platform.select({
    web: {},
    default: {
      marginRight: '6%',
    },
  }),

  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  listItemText: { color: '#f5f5f5', marginLeft: 8, fontSize: 14 },

  weatherCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginRight: 8
  },
  weatherText: { color: '#f5f5f5', fontSize: 16 },

  actionButton: {
    backgroundColor: '#121212',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: { color: '#f5f5f5', fontSize: 14 },

  moodRow: { flexDirection: 'row', marginTop: 8 },
  moodButton: { marginRight: 16 },

  suggestedMoodRow: Platform.select({
    web: {
      flexDirection: width > 700 ? 'row' : 'column',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 900,
      alignSelf: 'center',
      gap: 16,
    },
    default: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 900,
      alignSelf: 'center',
      gap: 12,
    },
  }),
  suggestedCard: Platform.select({
    web: {
      flex: 1,
      marginRight: width > 700 ? 8 : 0,
      marginBottom: width > 700 ? 0 : 16,
      minWidth: 260,
      maxWidth: 420,
    },
    default: {
      width: '48%',
      minWidth: 120,
      maxWidth: '48%',
      marginRight: '4%',
      marginBottom: 0,
    },
  }),
  moodCard: Platform.select({
    web: {
      flex: 1,
      marginLeft: width > 700 ? 8 : 0,
      minWidth: 260,
      maxWidth: 420,
    },
    default: {
      width: '48%',
      minWidth: 120,
      maxWidth: '48%',
      marginLeft: 0,
    },
  }),

  fixedBottomBarContainer: Platform.select({
    web: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      width: '100%',
      zIndex: 10,
      backgroundColor: 'transparent',
      paddingBottom: 8,
    },
    default: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 32,
      alignItems: 'center',
      width: '100%',
      zIndex: 10,
      backgroundColor: 'transparent',
      paddingBottom: 8,
    },
  }),
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    borderRadius: 0,
    marginHorizontal: 8,
    gap: 12,
  },
  bottomInput: {
    flex: 1,
    color: '#f5f5f5',
    fontSize: 16,
    backgroundColor: '#181818',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 0,
    marginRight: 0,
  },
  micButton: {
    marginLeft: 8,
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
