import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import mockApi from '../../services/mockApi'; // Adjusted path

// ... imports
// Note: I need to update the import list in the real file if I use icons, but I'll use Text for now to be safe or simple styles.

export default function StudentHomeScreen({ navigation, user, onLogout }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      const response = await mockApi.classrooms.list(user._id, user.role);
      setClasses(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('RequestForm', { classroom: item })}
    >
      <View style={styles.header}>
        <Text style={styles.code}>{item.code}</Text>
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.instructor}>GV: {item.instructor?.fullName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
         <Text style={styles.title}>My Classroom</Text>
         <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
         </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#E6A8D7" />
      ) : (
        <FlatList
          data={classes}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Chưa có lớp học nào.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  logoutText: {
    color: '#333',
    fontWeight: '600'
  },
  list: {
    paddingBottom: 20,
  },
  // ... rest of styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  code: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  instructor: {
    fontSize: 14,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  }
});
