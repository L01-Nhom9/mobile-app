
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/Button';
import ClassList from '../../components/ClassList';
import CreateClassModal from '../../components/CreateClassModal';

import { classroomService } from '../../services/classroomService';
import { useFocusEffect } from '@react-navigation/native';

export default function InstructorHomeScreen({ navigation, route, user, onLogout }) {
  const [searchText, setSearchText] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check for param to open modal
  React.useEffect(() => {
    if (route.params?.openCreateModal) {
      setCreateModalVisible(true);
      // Clear param to prevent reopening on subsequent focus if logic changes,
      // though navigation.navigate usually passes same params unless changed.
      // Better to clear it.
      navigation.setParams({ openCreateModal: undefined });
    }
  }, [route.params?.openCreateModal]);

  const fetchClasses = async () => {
    try {
        setLoading(true);
        const data = await classroomService.getTeachedClasses();
        // Map API data to UI format
        const mappedData = data.map(item => ({
            _id: item.id,
            name: item.name,
            code: item.joinCode, // Assuming joinCode is the Class Code to display
            instructor: item.instructor,
            color: getRandomColor(), // Helper for UI
            ...item
        }));
        setClasses(mappedData);
    } catch (error) {
        console.log('Error fetching classes:', error);
    } finally {
        setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchClasses();
    }, [])
  );

  const getRandomColor = () => {
      const colors = ['#93C5FD', '#C084FC', '#FCD34D', '#34D399', '#F87171'];
      return colors[Math.floor(Math.random() * colors.length)];
  };

  const filteredClasses = classes.filter(item => {
    const searchLower = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.code && item.code.toLowerCase().includes(searchLower))
    );
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onLogout}>
          <Ionicons name="log-out-outline" size={24} color="#202244" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>My classroom</Text>
        <GradientButton
          title="Tạo lớp mới"
          onPress={() => setCreateModalVisible(true)}
          style={styles.createButtonContainer}
          textStyle={styles.createButtonText}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for.."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {/* List */}
      <ClassList
        data={filteredClasses}
        searchText={searchText}
        onPressItem={(item) => navigation.navigate('ClassDetail', { classData: item })}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{loading ? 'Loading...' : `No classes found matching "${searchText}"`}</Text>
        }
      />

      {/* Create Class Modal */}
      <CreateClassModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={fetchClasses}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Roboto',
  },
  createButtonContainer: {
    borderRadius: 20,
  },
  createButtonText: {
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Roboto',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontFamily: 'Roboto',
  }
});
