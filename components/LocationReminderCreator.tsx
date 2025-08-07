import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface LocationReminderProps {
  visible: boolean;
  onClose: () => void;
  onReminderCreated: (reminder: LocationReminder) => void;
  taskId?: string;
}

interface LocationReminder {
  id: string;
  title: string;
  description?: string;
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  triggerType: 'enter' | 'exit';
  isActive: boolean;
  createdAt: Date;
  taskId?: string;
}

interface PredefinedLocation {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

const LocationReminderCreator: React.FC<LocationReminderProps> = ({
  visible,
  onClose,
  onReminderCreated,
  taskId,
}) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<'select' | 'details' | 'confirm'>('select');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [triggerType, setTriggerType] = useState<'enter' | 'exit'>('enter');
  const [radius, setRadius] = useState('100');
  const [loading, setLoading] = useState(false);

  const predefinedLocations: PredefinedLocation[] = [
    { id: 'home', name: 'Home', icon: 'home', color: '#4CAF50' },
    { id: 'work', name: 'Work', icon: 'office-building', color: '#2196F3' },
    { id: 'gym', name: 'Gym', icon: 'dumbbell', color: '#FF5722' },
    { id: 'grocery', name: 'Grocery Store', icon: 'cart', color: '#FF9800' },
    { id: 'current', name: 'Current Location', icon: 'map-marker', color: '#9C27B0' },
    { id: 'custom', name: 'Custom Location', icon: 'map-search', color: '#607D8B' },
  ];

  useEffect(() => {
    if (visible) {
      setStep('select');
      setTitle('');
      setDescription('');
      setSelectedLocation(null);
      setTriggerType('enter');
      setRadius('100');
    }
  }, [visible]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to create location-based reminders.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = reverseGeocode[0];
      const locationName = address
        ? `${address.street || ''} ${address.city || ''}`
        : 'Current Location';

      setSelectedLocation({
        name: 'Current Location',
        address: locationName,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setStep('details');
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to get current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: PredefinedLocation) => {
    if (location.id === 'current') {
      getCurrentLocation();
      return;
    }

    if (location.id === 'custom') {
      // In a real app, this would open a map picker or address search
      Alert.alert(
        'Custom Location',
        'Custom location picker would open here. For demo purposes, using a default location.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedLocation({
                name: 'Custom Location',
                address: '123 Main St, City, State',
                latitude: 37.7749,
                longitude: -122.4194,
              });
              setStep('details');
            },
          },
        ]
      );
      return;
    }

    // For demo purposes, using mock coordinates for predefined locations
    const mockLocations = {
      home: { lat: 37.7749, lng: -122.4194, address: '123 Home St' },
      work: { lat: 37.7849, lng: -122.4094, address: '456 Work Ave' },
      gym: { lat: 37.7649, lng: -122.4294, address: '789 Fitness Blvd' },
      grocery: { lat: 37.7549, lng: -122.4394, address: '321 Market St' },
    };

    const coords = mockLocations[location.id as keyof typeof mockLocations];
    if (coords) {
      setSelectedLocation({
        name: location.name,
        address: coords.address,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      setStep('details');
    }
  };

  const handleCreateReminder = () => {
    if (!title.trim() || !selectedLocation) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const reminder: LocationReminder = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      location: {
        ...selectedLocation,
        radius: parseInt(radius) || 100,
      },
      triggerType,
      isActive: true,
      createdAt: new Date(),
      taskId,
    };

    onReminderCreated(reminder);
    onClose();
  };

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme === 'light' ? '#fff' : '#1a1a1a',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#e0e0e0' : '#333',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: 20,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 24,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: '#007AFF',
    },
    inactiveDot: {
      backgroundColor: theme === 'light' ? '#ccc' : '#555',
    },
    locationGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    locationCard: {
      width: (width - 56) / 2,
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#333',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    selectedLocationCard: {
      borderColor: '#007AFF',
      backgroundColor: '#007AFF10',
    },
    locationIcon: {
      marginBottom: 8,
    },
    locationName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme === 'light' ? '#000' : '#fff',
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#333',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme === 'light' ? '#000' : '#fff',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#555',
    },
    triggerTypeContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    triggerTypeButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme === 'light' ? '#e0e0e0' : '#555',
      alignItems: 'center',
    },
    selectedTriggerType: {
      borderColor: '#007AFF',
      backgroundColor: '#007AFF10',
    },
    triggerTypeText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme === 'light' ? '#000' : '#fff',
    },
    selectedTriggerTypeText: {
      color: '#007AFF',
    },
    confirmCard: {
      backgroundColor: theme === 'light' ? '#f8f9fa' : '#333',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    confirmLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme === 'light' ? '#666' : '#aaa',
      marginBottom: 4,
    },
    confirmValue: {
      fontSize: 16,
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    button: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: '#007AFF',
    },
    secondaryButton: {
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#333',
      borderWidth: 1,
      borderColor: theme === 'light' ? '#ccc' : '#555',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryButtonText: {
      color: '#fff',
    },
    secondaryButtonText: {
      color: theme === 'light' ? '#000' : '#fff',
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    loadingText: {
      fontSize: 16,
      color: theme === 'light' ? '#666' : '#aaa',
      marginTop: 12,
    },
  });

  const renderStepIndicator = () => (
    <View style={dynamicStyles.stepIndicator}>
      {['select', 'details', 'confirm'].map((stepName, index) => (
        <View
          key={stepName}
          style={[
            dynamicStyles.stepDot,
            step === stepName || 
            (step === 'details' && index === 0) ||
            (step === 'confirm' && index <= 1)
              ? dynamicStyles.activeDot
              : dynamicStyles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );

  const renderLocationSelection = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[dynamicStyles.label, { textAlign: 'center', marginBottom: 20 }]}>
        Where would you like to be reminded?
      </Text>
      <View style={dynamicStyles.locationGrid}>
        {predefinedLocations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              dynamicStyles.locationCard,
              selectedLocation?.name === location.name && dynamicStyles.selectedLocationCard,
            ]}
            onPress={() => handleLocationSelect(location)}
            disabled={loading}
          >
            <View style={dynamicStyles.locationIcon}>
              <MaterialCommunityIcons
                name={location.icon}
                size={32}
                color={location.color}
              />
            </View>
            <Text style={dynamicStyles.locationName}>{location.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {loading && (
        <View style={dynamicStyles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={32}
            color="#007AFF"
          />
          <Text style={dynamicStyles.loadingText}>Getting your location...</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderDetailsForm = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Reminder Title *</Text>
        <TextInput
          style={dynamicStyles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Buy groceries"
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
        />
      </View>

      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Description (optional)</Text>
        <TextInput
          style={[dynamicStyles.input, { height: 80 }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Additional details..."
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Trigger When</Text>
        <View style={dynamicStyles.triggerTypeContainer}>
          <TouchableOpacity
            style={[
              dynamicStyles.triggerTypeButton,
              triggerType === 'enter' && dynamicStyles.selectedTriggerType,
            ]}
            onPress={() => setTriggerType('enter')}
          >
            <Text
              style={[
                dynamicStyles.triggerTypeText,
                triggerType === 'enter' && dynamicStyles.selectedTriggerTypeText,
              ]}
            >
              Arriving
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              dynamicStyles.triggerTypeButton,
              triggerType === 'exit' && dynamicStyles.selectedTriggerType,
            ]}
            onPress={() => setTriggerType('exit')}
          >
            <Text
              style={[
                dynamicStyles.triggerTypeText,
                triggerType === 'exit' && dynamicStyles.selectedTriggerTypeText,
              ]}
            >
              Leaving
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={dynamicStyles.inputGroup}>
        <Text style={dynamicStyles.label}>Detection Radius (meters)</Text>
        <TextInput
          style={dynamicStyles.input}
          value={radius}
          onChangeText={setRadius}
          placeholder="100"
          placeholderTextColor={theme === 'light' ? '#999' : '#666'}
          keyboardType="numeric"
        />
      </View>
    </ScrollView>
  );

  const renderConfirmation = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[dynamicStyles.label, { textAlign: 'center', marginBottom: 20 }]}>
        Review your location reminder
      </Text>
      
      <View style={dynamicStyles.confirmCard}>
        <Text style={dynamicStyles.confirmLabel}>Title</Text>
        <Text style={dynamicStyles.confirmValue}>{title}</Text>
        
        {description && (
          <>
            <Text style={dynamicStyles.confirmLabel}>Description</Text>
            <Text style={dynamicStyles.confirmValue}>{description}</Text>
          </>
        )}
        
        <Text style={dynamicStyles.confirmLabel}>Location</Text>
        <Text style={dynamicStyles.confirmValue}>
          {selectedLocation?.name} - {selectedLocation?.address}
        </Text>
        
        <Text style={dynamicStyles.confirmLabel}>Trigger</Text>
        <Text style={dynamicStyles.confirmValue}>
          When {triggerType === 'enter' ? 'arriving at' : 'leaving'} location
        </Text>
        
        <Text style={dynamicStyles.confirmLabel}>Detection Range</Text>
        <Text style={dynamicStyles.confirmValue}>{radius} meters</Text>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (step) {
      case 'select':
        return renderLocationSelection();
      case 'details':
        return renderDetailsForm();
      case 'confirm':
        return renderConfirmation();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'select':
        return 'Choose Location';
      case 'details':
        return 'Reminder Details';
      case 'confirm':
        return 'Confirm Reminder';
      default:
        return 'Location Reminder';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'select':
        return selectedLocation !== null;
      case 'details':
        return title.trim().length > 0;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 'select') {
      setStep('details');
    } else if (step === 'details') {
      setStep('confirm');
    } else {
      handleCreateReminder();
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('select');
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={dynamicStyles.overlay}>
        <View style={dynamicStyles.container}>
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.title}>{getStepTitle()}</Text>
            <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
              <Ionicons
                name="close"
                size={20}
                color={theme === 'light' ? '#666' : '#aaa'}
              />
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}

          <View style={dynamicStyles.content}>
            {renderContent()}
          </View>

          <View style={dynamicStyles.buttonContainer}>
            {step !== 'select' && (
              <TouchableOpacity
                style={[dynamicStyles.button, dynamicStyles.secondaryButton]}
                onPress={handleBack}
              >
                <Text style={[dynamicStyles.buttonText, dynamicStyles.secondaryButtonText]}>
                  Back
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                dynamicStyles.button,
                dynamicStyles.primaryButton,
                !canProceed() && { opacity: 0.5 },
              ]}
              onPress={handleNext}
              disabled={!canProceed() || loading}
            >
              <Text style={[dynamicStyles.buttonText, dynamicStyles.primaryButtonText]}>
                {step === 'confirm' ? 'Create Reminder' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LocationReminderCreator;
