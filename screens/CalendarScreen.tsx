import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  type: 'meeting' | 'task' | 'personal';
}

const CalendarScreen: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, [selectedDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - will be replaced with API call
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Meeting',
          startTime: '2025-08-01T10:00:00',
          endTime: '2025-08-01T11:00:00',
          description: 'Weekly team sync',
          type: 'meeting',
        },
        {
          id: '2',
          title: 'Project Deadline',
          startTime: '2025-08-01T17:00:00',
          endTime: '2025-08-01T17:30:00',
          description: 'Submit project proposal',
          type: 'task',
        },
        {
          id: '3',
          title: 'Dentist Appointment',
          startTime: '2025-08-02T14:00:00',
          endTime: '2025-08-02T15:00:00',
          description: 'Regular checkup',
          type: 'personal',
        },
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getEventTypeIcon = (type: CalendarEvent['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'meeting': return 'people';
      case 'task': return 'checkbox';
      case 'personal': return 'person';
      default: return 'calendar';
    }
  };

  const getEventTypeColor = (type: CalendarEvent['type']): string => {
    switch (type) {
      case 'meeting': return '#007AFF';
      case 'task': return '#FF9500';
      case 'personal': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const handleCreateEvent = () => {
    Alert.alert(
      'Create Event',
      'Event creation will be implemented in the next phase with full calendar integration.',
      [{ text: 'OK' }]
    );
  };

  const handleSyncCalendar = () => {
    Alert.alert(
      'Sync Calendar',
      'Google Calendar sync will be implemented in the next phase.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSyncCalendar}>
            <Ionicons name="sync" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleCreateEvent}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar View - Simple for now */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Today's Events */}
      <ScrollView style={styles.eventsContainer} contentContainerStyle={styles.eventsContent}>
        <Text style={styles.sectionTitle}>Today's Events</Text>
        
        {events.length > 0 ? (
          events.map(event => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventTypeContainer}>
                  <Ionicons 
                    name={getEventTypeIcon(event.type)} 
                    size={20} 
                    color={getEventTypeColor(event.type)} 
                  />
                  <Text style={[styles.eventType, { color: getEventTypeColor(event.type) }]}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Text>
                </View>
                <Text style={styles.eventTime}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Text>
              </View>
              
              <Text style={styles.eventTitle}>{event.title}</Text>
              
              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noEventsContainer}>
            <Ionicons name="calendar-outline" size={64} color="#8E8E93" />
            <Text style={styles.noEventsText}>No events today</Text>
            <Text style={styles.noEventsSubtext}>Tap + to create your first event</Text>
          </View>
        )}

        {/* Upcoming Events Section */}
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <View style={styles.upcomingEvents}>
          <Text style={styles.comingSoonText}>
            📅 Advanced calendar features coming soon:
          </Text>
          <Text style={styles.featureList}>
            • Google Calendar sync{'\n'}
            • Smart meeting scheduling{'\n'}
            • AI-powered time suggestions{'\n'}
            • Recurring events{'\n'}
            • Team calendar sharing{'\n'}
            • Meeting reminders
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  eventsContainer: {
    flex: 1,
  },
  eventsContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  upcomingEvents: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featureList: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default CalendarScreen;
