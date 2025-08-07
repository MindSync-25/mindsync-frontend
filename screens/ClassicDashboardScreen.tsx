import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ClassicDashboardScreenProps {
  navigation?: any;
}

const ClassicDashboardScreen: React.FC<ClassicDashboardScreenProps> = ({ navigation }) => {
  const { width } = Dimensions.get('window');
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);
  
  // Determine layout based on screen width
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  
  // Calculate card width based on screen size
  const getCardWidth = () => {
    if (isDesktop) return '24%'; // 4 columns on desktop
    if (isTablet) return '32%';  // 3 columns on tablet
    return '48%';                // 2 columns on mobile
  };

  // Calculate card margin based on screen size
  const getCardMargin = () => {
    if (isDesktop) return '0.5%'; // Small margin on desktop
    if (isTablet) return '1%';    // Medium margin on tablet
    return '1%';                  // Proper margin on mobile
  };

  // Calculate container padding based on screen size
  const getContainerPadding = () => {
    if (isDesktop) return 40;
    if (isTablet) return 24;
    return 16;
  };

  // All widgets data
  const allWidgets = [
    {
      id: 'tasks',
      title: 'Task Management',
      icon: 'checkmark-circle-outline',
      content: (
        <>
          <Pressable style={styles.taskItem}>
            <Pressable style={styles.checkbox}>
              <Ionicons name="checkmark" size={8} color="#C6D0F5" />
            </Pressable>
            <Text style={styles.taskText}>Complete project report</Text>
          </Pressable>
          <Pressable style={styles.taskItem}>
            <View style={styles.checkbox} />
            <Text style={styles.taskText}>Team meeting prep</Text>
          </Pressable>
          <Text style={styles.cardDescription}>5 pending • AI suggestions ready</Text>
        </>
      )
    },
    {
      id: 'collaboration',
      title: 'Collaboration & Communication',
      icon: 'people-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>3 team workspaces</Text>
          <Text style={styles.cardDescription}>2 new messages</Text>
          <Text style={styles.cardDescription}>Files shared today: 4</Text>
        </>
      )
    },
    {
      id: 'calendar',
      title: 'Calendar & Scheduling',
      icon: 'calendar-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Next: Team meeting</Text>
          <Text style={styles.cardDescription}>Today, 2:00 PM</Text>
          <Text style={styles.cardDescription}>AI auto-scheduled</Text>
        </>
      )
    },
    {
      id: 'communication',
      title: 'Communication Hub',
      icon: 'mail-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>12 unread emails</Text>
          <Text style={styles.cardDescription}>3 urgent messages</Text>
          <Text style={styles.cardDescription}>Unified inbox</Text>
        </>
      )
    },
    {
      id: 'meetings',
      title: 'Meeting & Video Calls',
      icon: 'videocam-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Next call: 30 min</Text>
          <Text style={styles.cardDescription}>AI transcription ready</Text>
          <Text style={styles.cardDescription}>Auto action items</Text>
        </>
      )
    },
    {
      id: 'timetracking',
      title: 'Time Tracking & Productivity',
      icon: 'time-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Focus time: 2h 30m</Text>
          <Text style={styles.cardDescription}>Productivity: 85%</Text>
          <Text style={styles.cardDescription}>Break in 15 min</Text>
        </>
      )
    },
    {
      id: 'aiassistant',
      title: 'Proactive AI Assistance',
      icon: 'bulb-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>3 smart suggestions</Text>
          <Text style={styles.cardDescription}>Priority updated</Text>
          <Text style={styles.cardDescription}>Context-aware reminders</Text>
        </>
      )
    },
    {
      id: 'personalassistant',
      title: 'Personal Assistant',
      icon: 'person-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Daily digest ready</Text>
          <Text style={styles.cardDescription}>Voice commands: 12</Text>
          <Text style={styles.cardDescription}>Habits tracked</Text>
        </>
      )
    },
    {
      id: 'analytics',
      title: 'Analytics & Insights',
      icon: 'analytics-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Weekly report ready</Text>
          <Text style={styles.cardDescription}>Performance: +15%</Text>
          <Text style={styles.cardDescription}>Forecast: On track</Text>
        </>
      )
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle & Well-Being',
      icon: 'heart-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Steps: 8,542/10,000</Text>
          <Text style={styles.cardDescription}>Hydration reminder</Text>
          <Text style={styles.cardDescription}>Mood: Good 😊</Text>
        </>
      )
    },
    {
      id: 'travel',
      title: 'Travel & Mobility',
      icon: 'car-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Route to office: 25 min</Text>
          <Text style={styles.cardDescription}>Traffic: Light</Text>
          <Text style={styles.cardDescription}>Trip planner ready</Text>
        </>
      )
    },
    {
      id: 'learning',
      title: 'Learning & Career',
      icon: 'school-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Course progress: 65%</Text>
          <Text style={styles.cardDescription}>Resume updated</Text>
          <Text style={styles.cardDescription}>3 job matches</Text>
        </>
      )
    },
    {
      id: 'business',
      title: 'Business & Finance',
      icon: 'business-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Monthly spent: $1,250</Text>
          <Text style={styles.cardDescription}>Budget: $2,000</Text>
          <Text style={styles.cardDescription}>Portfolio: +2.1%</Text>
        </>
      )
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: 'link-outline',
      content: (
        <>
          <Text style={styles.cardDescription}>Connected: 8 apps</Text>
          <Text style={styles.cardDescription}>GitHub, Slack, Drive</Text>
          <Text style={styles.cardDescription}>API calls: 1.2k</Text>
        </>
      )
    }
  ];

  // Group widgets into pages for mobile (6 widgets per page)
  const getWidgetPages = () => {
    if (!isMobile) return [allWidgets]; // Show all on tablet/desktop
    
    const pages = [];
    for (let i = 0; i < allWidgets.length; i += 6) {
      pages.push(allWidgets.slice(i, i + 6));
    }
    return pages;
  };

  const widgetPages = getWidgetPages();
  const totalPages = widgetPages.length;

  const handleScroll = (event) => {
    if (!isMobile) return;
    
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / width);
    setCurrentPage(pageIndex);
  };

  const handleWidgetPress = (widgetId: string) => {
    // Navigate to specific feature screens based on widget ID
    switch (widgetId) {
      case 'tasks':
        navigation?.navigate('Tasks'); // TaskManagementScreen
        break;
      case 'collaboration':
        navigation?.navigate('Chat'); // ChatScreen for team collaboration
        break;
      case 'calendar':
        navigation?.navigate('Calendar'); // CalendarScreen
        break;
      case 'communication':
        navigation?.navigate('Chat'); // Unified communication hub
        break;
      case 'meetings':
        navigation?.navigate('Calendar'); // Meeting scheduling via calendar
        break;
      case 'timetracking':
        navigation?.navigate('Analytics'); // Time tracking analytics
        break;
      case 'aiassistant':
        navigation?.navigate('Chat'); // AI assistant via chat
        break;
      case 'personalassistant':
        navigation?.navigate('Profile'); // Personal settings and assistant
        break;
      case 'analytics':
        navigation?.navigate('Analytics'); // AnalyticsScreen
        break;
      case 'lifestyle':
        navigation?.navigate('Profile'); // Lifestyle settings in profile
        break;
      case 'travel':
        navigation?.navigate('ComingSoon'); // Travel features coming soon
        break;
      case 'learning':
        navigation?.navigate('ComingSoon'); // Learning features coming soon
        break;
      case 'business':
        navigation?.navigate('Analytics'); // Business analytics
        break;
      case 'integrations':
        navigation?.navigate('ComingSoon'); // Integration settings coming soon
        break;
      default:
        console.log('Widget pressed:', widgetId);
    }
  };

  const renderWidget = (widget) => (
    <Pressable 
      key={widget.id} 
      style={[styles.card, { width: getCardWidth(), marginHorizontal: getCardMargin() }]}
      onPress={() => handleWidgetPress(widget.id)}
    >
      <View style={styles.cardHeader}>
        <Ionicons name={widget.icon} size={18} color="#C6D0F5" style={styles.cardIcon} />
        <Text style={styles.cardTitle}>{widget.title}</Text>
      </View>
      {widget.content}
    </Pressable>
  );

  const renderMobileContent = () => (
    <View style={styles.container}>
      {/* Fixed Today's Overview at Top */}
      <View style={[styles.overviewCard, { marginHorizontal: getContainerPadding(), marginTop: 16 }]}>
        <Text style={styles.overviewTitle}>Today's overview</Text>
        <View style={styles.overviewRow}>
          <View style={styles.overviewItemContainer}>
            <Ionicons name="folder-outline" size={14} color="#C6D0F5" style={styles.overviewIcon} />
            <Text style={styles.overviewItem}>5 tasks due</Text>
          </View>
          <View style={styles.overviewItemContainer}>
            <Ionicons name="notifications-outline" size={14} color="#C6D0F5" style={styles.overviewIcon} />
            <Text style={styles.overviewItem}>3 reminders</Text>
          </View>
          <View style={styles.overviewItemContainer}>
            <Ionicons name="calendar-outline" size={14} color="#C6D0F5" style={styles.overviewIcon} />
            <Text style={styles.overviewItem}>Meeting at 2:00 PM</Text>
          </View>
        </View>
      </View>

      {/* Fixed Header with Profile Icon */}
      <View style={[styles.headerContainer, { paddingHorizontal: getContainerPadding(), paddingTop: 12 }]}>
        <Text style={styles.greeting}>Hello!</Text>
        <Pressable 
          style={styles.profileIcon}
          onPress={() => navigation?.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#C6D0F5" />
        </Pressable>
      </View>

      {/* Swipeable Widgets with Better Spacing */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.horizontalScrollView}
        contentContainerStyle={{ paddingBottom: 120 }} // Space for pagination and chat
      >
        {widgetPages.map((pageWidgets, pageIndex) => (
          <View key={pageIndex} style={[styles.pageContainer, { width }]}>
            <ScrollView 
              style={[styles.scrollContainer, { paddingHorizontal: getContainerPadding() }]} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Feature Grid with Better Spacing */}
              <View style={[styles.gridContainer, { minHeight: 400 }]}>
                {pageWidgets.map(renderWidget)}
              </View>
            </ScrollView>
          </View>
        ))}
      </ScrollView>
      
      {/* Fixed Pagination Dots above Chat Input */}
      <View style={styles.fixedPaginationContainer}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentPage ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>

      {/* Fixed Chat Input at Bottom */}
      <View style={styles.fixedChatContainer}>
        <View style={styles.chatInputRow}>
          <TextInput 
            placeholder="Ask me anything..." 
            placeholderTextColor="#6B7280"
            style={styles.compactChatInput}
          />
          <Pressable style={styles.micButtonExternal}>
            <Ionicons name="mic-outline" size={18} color="#C6D0F5" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderTabletDesktopContent = () => (
    <View style={styles.container}>
      <ScrollView 
        style={[styles.scrollContainer, { paddingHorizontal: getContainerPadding() }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }} // Space for fixed chat input
      >
        {/* Header with Profile Icon */}
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>Hello!</Text>
          <Pressable 
            style={styles.profileIcon}
            onPress={() => navigation?.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color="#C6D0F5" />
          </Pressable>
        </View>

        {/* Today's Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Today's overview</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItemContainer}>
              <Ionicons name="folder-outline" size={14} color="#C6D0F5" style={styles.overviewIcon} />
              <Text style={styles.overviewItem}>5 tasks due</Text>
            </View>
            <View style={styles.overviewItemContainer}>
              <Ionicons name="notifications-outline" size={14} color="#C6D0F5" style={styles.overviewIcon} />
              <Text style={styles.overviewItem}>3 reminders</Text>
            </View>
            <View style={styles.overviewItemContainer}>
              <Ionicons name="calendar-outline" size={14} color="#C6D0F5" style={styles.overviewIcon} />
              <Text style={styles.overviewItem}>Meeting at 2:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Feature Grid */}
        <View style={styles.gridContainer}>
          {allWidgets.map(renderWidget)}
        </View>
      </ScrollView>

      {/* Fixed Chat Input at Bottom for Web/Tablet */}
      <View style={styles.fixedChatContainer}>
        <View style={styles.chatInputRow}>
          <TextInput 
            placeholder="Ask me anything..." 
            placeholderTextColor="#6B7280"
            style={styles.compactChatInput}
          />
          <Pressable style={styles.micButtonExternal}>
            <Ionicons name="mic-outline" size={18} color="#C6D0F5" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isMobile ? renderMobileContent() : renderTabletDesktopContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C6D0F5',
  },
  profileIcon: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a', // Dark gray
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  overviewCard: {
    backgroundColor: '#1a1a1a', // Dark gray
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C6D0F5',
    marginBottom: 6,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  overviewItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  overviewIcon: {
    marginRight: 4,
  },
  overviewItem: {
    fontSize: 12,
    color: '#CCCCCC', // Light gray
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1a1a1a', // Dark gray
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIcon: {
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C6D0F5',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C6D0F5',
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 13,
    color: '#CCCCCC', // Light gray
    lineHeight: 18,
    marginTop: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#C6D0F5',
    marginRight: 8,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  taskText: {
    fontSize: 13,
    color: '#CCCCCC',
    flex: 1,
  },
  weatherTemp: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C6D0F5',
  },
  suggestionButtons: {
    gap: 6,
  },
  suggestionButton: {
    backgroundColor: '#333333', // Medium gray
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  suggestionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionButtonIcon: {
    marginRight: 4,
  },
  suggestionText: {
    color: '#C6D0F5',
    fontSize: 11,
    textAlign: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  moodButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
  moodEmoji: {
    fontSize: 20,
  },
  chatContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  chatInput: {
    backgroundColor: '#1a1a1a', // Dark gray
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a', // Dark gray
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactChatInput: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark gray
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#C6D0F5',
    fontSize: 14,
  },
  chatInputWithMic: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  micButton: {
    marginLeft: 12,
    padding: 4,
  },
  micButtonExternal: {
    padding: 8,
  },
  fixedChatContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24, // Extra space for home indicator
  },
  fixedPaginationContainer: {
    position: 'absolute',
    bottom: 70, // Above the chat input
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#000000',
  },
  horizontalScrollView: {
    flex: 1,
    marginTop: 16,
  },
  pageContainer: {
    flex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#C6D0F5',
  },
  inactiveDot: {
    backgroundColor: '#666666',
  },
});

export default ClassicDashboardScreen;
