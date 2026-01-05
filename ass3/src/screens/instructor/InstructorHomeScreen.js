import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/Button';
import ClassList from '../../components/ClassList';
import CreateClassModal from '../../components/CreateClassModal';
import { classroomService } from '../../services/classroomService';

export default function InstructorHomeScreen({ navigation, user, onLogout }) {
  const [searchText, setSearchText] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await classroomService.getMyTeachingClasses();

      const COLORS = ['#93C5FD', '#C084FC', '#FCD34D', '#F9A8D4', '#6EE7B7', '#FDBA74'];

      const mappedData = (data || []).map((item, index) => ({
        ...item,
        _id: item.id,
        code: item.id || item.code,
        joinCode: item.joinCode || 'N/A',
        instructor: user?.fullName || 'Me',
        color: COLORS[index % COLORS.length] 
      }));
      setClasses(mappedData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(item => {
    const searchLower = searchText.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(searchLower) ||
      (item.code || '').toLowerCase().includes(searchLower)
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
          loading ? (
            <Text style={styles.emptyText}>Đang tải...</Text>
          ) : (
            <Text style={styles.emptyText}>No classes found matching "{searchText}"</Text>
          )
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
