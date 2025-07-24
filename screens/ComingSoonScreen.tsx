import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ComingSoonScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="close" size={28} color="#f5f5f5" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>🚀 We Launch Soon!</Text>
      <Text style={styles.subtitle}>This feature is coming soon. Stay tuned!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 16,
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  closeButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#232323',
  },
  title: {
    fontSize: 28,
    color: '#f5f5f5',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 48,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
  },
});

export default ComingSoonScreen;
