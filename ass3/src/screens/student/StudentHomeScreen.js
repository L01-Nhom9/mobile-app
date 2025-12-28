import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';

// Mock data to match the UI screenshot
const MOCK_CLASSES = [
  { _id: '1', name: 'Quản lý dự án', code: 'CO3007', instructor: 'TRẦN VĂN HOÀI', color: '#93C5FD' },
  { _id: '2', name: 'Đánh giá Hiệu năng Hệ thống', code: 'CO3007', instructor: 'BÙI XUÂN GIANG', color: '#C084FC' },
  { _id: '3', name: 'Phát triển ứng dụng thiết bị di động', code: 'CO3007', instructor: 'HOÀNG LÊ HẢI THANH', color: '#FCD34D' },
];

const ITEMS_PER_PAGE = 5;

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

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('RequestForm', { classroom: item })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
             <Text style={styles.className}>{item.name}</Text>
             <Text style={styles.classDetails}>({item.code})_{item.instructor}</Text>
             <View style={[styles.progressBar, { backgroundColor: item.color }]} />
        </View>
        <Ionicons name="chevron-forward" size={24} color="#93C5FD" />
      </View>
    </TouchableOpacity>
  );

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
          <TouchableOpacity onPress={() => navigation.navigate('JoinClass')}>
            <LinearGradient
                colors={['#A78BFA', '#F9A8D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.joinButton}
            >
                <Text style={styles.joinButtonText}>Tham gia lớp</Text>
            </LinearGradient>
          </TouchableOpacity>
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
      <FlatList
        data={filteredClasses}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            <Text style={styles.emptyText}>No classes found matching "{searchText}"</Text>
        }
      />

      {/* Pagination (Conditional) */}
      {filteredClasses.length > ITEMS_PER_PAGE && (
        <View style={styles.pagination}>
            <TouchableOpacity style={styles.pageArrow}>
                <Ionicons name="chevron-back" size={20} color="#999" />
            </TouchableOpacity>
            <Text style={styles.pageNumber}>1</Text>
            <LinearGradient
                colors={['#93C5FD', '#F9A8D4']}
                style={styles.activePage}
            >
                <Text style={styles.activePageText}>2</Text>
            </LinearGradient>
            <Text style={styles.pageNumber}>3</Text>
            <TouchableOpacity style={styles.pageArrow}>
                <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
        </View>
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
  joinButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
  },
  joinButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
      fontFamily: 'Roboto',
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
  listContent: {
      paddingBottom: 20,
  },
  card: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
  },
  cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  cardInfo: {
      flex: 1,
      marginRight: 10,
  },
  className: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 5,
      fontFamily: 'Roboto',
  },
  classDetails: {
      fontSize: 12,
      color: '#555',
      marginBottom: 10,
      fontFamily: 'Roboto',
  },
  progressBar: {
      height: 4,
      width: '80%', 
      borderRadius: 2,
  },
  pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
  },
  pageArrow: {
      padding: 10,
  },
  pageNumber: {
      fontSize: 16,
      color: '#333',
      marginHorizontal: 15,
      fontFamily: 'Roboto',
  },
  activePage: {
      width: 30,
      height: 30,
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
  },
  activePageText: {
      color: 'white',
      fontWeight: 'bold',
      fontFamily: 'Roboto',
  },
  emptyText: {
      textAlign: 'center',
      color: '#999',
      marginTop: 20,
      fontFamily: 'Roboto',
  }
});
