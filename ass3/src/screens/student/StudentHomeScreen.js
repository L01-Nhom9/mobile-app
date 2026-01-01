import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/Button';
import ClassList from '../../components/ClassList';

// Mock data to match the UI screenshot
const MOCK_CLASSES = [
  { _id: '1', name: 'Quản lý dự án', code: 'CO3007', instructor: 'TRẦN VĂN HOÀI', color: '#93C5FD' },
  { _id: '2', name: 'Đánh giá Hiệu năng Hệ thống', code: 'CO3007', instructor: 'BÙI XUÂN GIANG', color: '#C084FC' },
  { _id: '3', name: 'Phát triển ứng dụng thiết bị di động', code: 'CO3007', instructor: 'HOÀNG LÊ HẢI THANH', color: '#FCD34D' },
];

export default function StudentHomeScreen({ navigation, onLogout }) {
  const [searchText, setSearchText] = useState('');

  // Filter classes based on search text
  const filteredClasses = MOCK_CLASSES.filter(item => {
    const searchLower = searchText.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.code.toLowerCase().includes(searchLower) ||
      item.instructor.toLowerCase().includes(searchLower)
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
      <ClassList
        data={filteredClasses}
        searchText={searchText}
        onPressItem={(item) => navigation.navigate('RequestForm', { classroom: item })}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No classes found matching "{searchText}"</Text>
        }
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
