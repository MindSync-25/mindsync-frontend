import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Profile: undefined;
  ComingSoon: undefined;
};
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();

  const [userSession, setUserSession] = useState({
    userName: '',
    userId: '',
    email: '',
    isLoaded: false
  });

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme === 'light' ? '#fff' : '#000',
    },
    header: {
      fontSize: 28,
      color: theme === 'light' ? '#000' : '#f5f5f5',
      fontWeight: 'bold',
      textAlignVertical: 'center',
      textAlign: 'left',
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#181818',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 18,
      width: 320,
      maxWidth: '90%',
      borderColor: theme === 'light' ? '#e0e0e0' : '#232323',
      borderWidth: 1,
    },
    card: {
      backgroundColor: theme === 'light' ? '#f5f5f5' : '#181818',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    tileText: {
      color: theme === 'light' ? '#000' : '#f5f5f5',
      fontSize: 18,
    },
    micButton: {
      marginLeft: 8,
      backgroundColor: theme === 'light' ? '#e0e0e0' : '#232323',
      borderRadius: 20,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

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

  // Loads session when component mounts
  useEffect(() => {
    loadUserSession();
  }, []);

  // Functions to manage session
  const loadUserSession = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        setUserSession({
          userName: session.userName || '',
          userId: session.userId || '',
          email: session.email || '',
          isLoaded: true
        });
      } else {
        setUserSession((prev) => ({ ...prev, isLoaded: true }));
      }
    } catch (e) {
      setUserSession((prev) => ({ ...prev, isLoaded: true }));
    }
  };

  const saveUserSession = async (userData) => {
    try {
      await AsyncStorage.setItem('userSession', JSON.stringify(userData));
      setUserSession({
        userName: userData.userName || '',
        userId: userData.userId || '',
        email: userData.email || '',
        isLoaded: true
      });
    } catch (e) {
      // handle error if needed
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme === 'light' ? '#fff' : '#000' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centeredContent}>

          {/* Header */}
          <View style={[styles.header, styles.maxCardWidth]}>
            <Text style={dynamicStyles.header}>
              {userSession.isLoaded && userSession.userName ? (
                <>
                  Hello <Text style={styles.nameFont}>{userSession.userName.split(' ')[0]}</Text> !
                </>
              ) : 'Hello!'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <MaterialCommunityIcons name="account-circle" size={28} color={theme === 'light' ? '#000' : '#f5f5f5'} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, styles.maxCardWidth]}>
            <MaterialCommunityIcons name="magnify" size={20} color={theme === 'light' ? '#666' : '#888'} />
            <TextInput
              placeholder="Tap to search"
              placeholderTextColor={theme === 'light' ? '#666' : '#888'}
              style={[styles.searchInput, { color: theme === 'light' ? '#000' : '#f5f5f5' }]}
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
          <View style={styles.maxCardWidth}>
            <View style={styles.grid}>
              {/* To-Do List */}
              <TouchableOpacity style={[styles.card, styles.gridItemLeft]} onPress={() => navigation.navigate('ComingSoon')} activeOpacity={0.8}>
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
              <TouchableOpacity style={[styles.card, styles.gridItemLeft]} onPress={() => navigation.navigate('ComingSoon')} activeOpacity={0.8}>
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
  nameFont: {
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : Platform.OS === 'android' ? 'DancingScript-Regular' : 'cursive',
    fontSize: 24, // Smaller or equal to Hello
    fontWeight: '400',
    textAlignVertical: 'center',
    textAlign: 'left',
    letterSpacing: 1,
    backgroundColor: 'transparent',
    verticalAlign: 'bottom', // Use supported value for alignment
    alignSelf: 'baseline',
  },
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
      width: Dimensions.get('window').width, // Fixed invalid value
      minHeight: Dimensions.get('window').height, // Fixed invalid value
      flex: 1,
      backgroundColor: '#000',
    },
    default: {
      flex: 1,
      backgroundColor: '#000',
    },
  }),

  // Removed bottomBarContainer, not needed

  centeredContent: Platform.select({
    web: {
      width: '100%',
      alignItems: 'center',
      maxWidth: 900,
    },
    default: {
      width: '100%',
      alignItems: 'stretch',
    },
  }),

  header: Platform.select({
    web: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      width: '100%',
      maxWidth: 900,
      alignSelf: 'center',
      paddingHorizontal: 0,
    },
    default: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      width: '100%',
      alignSelf: 'stretch',
      paddingHorizontal: 0,
      marginHorizontal: 8,
    },
  }),
  greeting: {
    fontSize: 32,
    color: '#f5f5f5',
  },

  searchBar: Platform.select({
    web: {
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
    default: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#121212',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 16,
      width: '100%',
      alignSelf: 'stretch',
      marginHorizontal: 8,
    },
  }),
  searchInput: { flex: 1, marginLeft: 8, color: '#f5f5f5', fontSize: 16 },

  card: Platform.select({
    web: {
      backgroundColor: '#1e1e1e',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
    },
    default: {
      backgroundColor: '#1e1e1e',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      width: '100%',
      alignSelf: 'stretch',
      marginHorizontal: 0,
    },
  }),
  maxCardWidth: Platform.select({
    web: {
      width: '100%',
      maxWidth: 900,
      alignSelf: 'center',
    },
    default: {
      width: '100%',
      alignSelf: 'stretch',
      marginHorizontal: 8,
    },
  }),
  cardTitle: { fontSize: 18, color: '#f5f5f5', marginBottom: 8 },

  overviewRow: { flexDirection: 'row', alignItems: 'center' },
  overviewText: { color: '#f5f5f5', marginLeft: 8, fontSize: 16 },

  grid: Platform.select({
    web: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      alignSelf: 'center',
      marginTop: 0,
    },
    default: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      alignSelf: 'center',
      marginTop: 0,
    },
  }),
  gridItem: {
    width: '48%',
    marginBottom: 16,
    alignSelf: 'center',
  },

  gridItemLeft: {
    width: '48%',
    marginRight: '2%',
  },

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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      maxWidth: 900,
      alignSelf: 'center',
      gap: 6, // Reduced gap between widgets
    },
    default: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      alignSelf: 'stretch',
      gap: 6, // Reduced gap between widgets
    },
  }),
  suggestedCard: Platform.select({
    web: {
      width: '48%', // Match the width of gridItem and gridItemLeft
      marginRight: '2%', // Reduced margin to decrease gap
      marginBottom: 0,
    },
    default: {
      width: '48%', // Match the width of gridItem and gridItemLeft
      marginRight: '2%', // Reduced margin to decrease gap
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
      alignItems: 'stretch',
      width: '100%',
      zIndex: 10,
      backgroundColor: 'transparent',
      paddingBottom: 8,
    },
  }),
  bottomBar: Platform.select({
    web: {
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
    default: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 0,
      paddingVertical: 0,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      borderTopColor: 'transparent',
      width: '100%',
      alignSelf: 'stretch',
      borderRadius: 0,
      marginHorizontal: 8,
      gap: 12,
    },
  }),
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
