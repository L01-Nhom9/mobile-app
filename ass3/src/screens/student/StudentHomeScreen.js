import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/Button';
import ClassList from '../../components/ClassList';
import { classroomService } from '../../services/classroomService';
import { useFocusEffect } from '@react-navigation/native';

const CARD_COLORS = ['#93C5FD', '#C084FC', '#FCD34D', '#86EFAC', '#FDA4AF', '#FDBA74'];

export default function StudentHomeScreen({ navigation, onLogout }) {
  const [searchText, setSearchText] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const data = await classroomService.getEnrolledClasses();
      // Map API data to UI format
      const mappedClasses = data.map((item, index) => ({
        _id: item.id,
        name: item.name,
        code: item.joinCode, // Mapping joinCode to code
        instructor: item.Instructor || item.instructor, 
        color: CARD_COLORS[index % CARD_COLORS.length]
      }));
      setClasses(mappedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClass = (item) => {
    Alert.alert(
      'Rời lớp học',
      `Bạn có chắc chắn muốn rời lớp "${item.name}" không?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Rời lớp',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await classroomService.leaveClass(item._id);
              Alert.alert('Thành công', 'Đã rời lớp học thành công.');
              fetchClasses(); // Refresh list
            } catch (error) {
              console.log('Leave class error:', error);
              Alert.alert('Lỗi', 'Không thể rời lớp học. Vui lòng thử lại.');
              setLoading(false); // Only set loading false on error, success will re-fetch which sets loading
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchClasses();
    }, [])
  );

  // Filter classes based on search text
  const filteredClasses = classes.filter(item => {
    const searchLower = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.code && item.code.toLowerCase().includes(searchLower)) ||
      (item.instructor && item.instructor.toLowerCase().includes(searchLower))
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
          title="Tham gia lớp"
          onPress={() => navigation.navigate('JoinClass')}
          style={styles.joinButtonContainer}
          textStyle={styles.joinButtonText}
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
      {loading ? (
        <ActivityIndicator size="large" color="#93C5FD" style={{ marginTop: 20 }} />
      ) : (
        <ClassList
          data={filteredClasses}
          searchText={searchText}
          onPressItem={(item) => navigation.navigate('RequestForm', { classroom: item })}
          onLeave={handleLeaveClass}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {classes.length === 0 ? "You haven't joined any classes yet." : `No classes found matching "${searchText}"`}
            </Text>
          }
        />
      )}
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
  joinButtonContainer: {
    borderRadius: 20,
  },
  joinButtonText: {
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

