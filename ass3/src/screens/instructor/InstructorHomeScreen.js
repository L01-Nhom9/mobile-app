import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import mockApi from '../../services/mockApi';

export default function InstructorHomeScreen({ navigation, user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setRequests([
           { _id: 'r1', student: { fullName: 'Nguyen Van A', studentId: '201201' }, classroom: { name: 'Mobile Dev', code: 'CO3007' }, reason: 'Sốt cao', date: '2025-12-28', status: 'pending' },
           { _id: 'r2', student: { fullName: 'Le Thi C', studentId: '201202' }, classroom: { name: 'Software Project', code: 'CO3008' }, reason: 'Chuyện gia đình', date: '2025-12-29', status: 'pending' }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = (id) => {
    Alert.alert("Approved", `Request ${id} approved`);
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  const handleReject = (id) => {
    Alert.alert("Rejected", `Request ${id} rejected`);
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.studentName}>{item.student.fullName} - {item.student.studentId}</Text>
        <TouchableOpacity style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.classInfo}>{item.classroom.name} ({item.classroom.code})</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Ngày:</Text>
        <Text style={styles.value}>{item.date}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Lý do:</Text>
        <Text style={styles.value}>{item.reason}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleReject(item._id)}>
          <Text style={styles.btnText}>Từ chối</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleApprove(item._id)}>
          <Text style={styles.btnText}>Duyệt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
         <Text style={styles.title}>Quản lý đơn nghỉ</Text>
         <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
         </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#E6A8D7" />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Không có đơn nào chờ duyệt.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  logoutText: {
    color: '#333',
    fontWeight: '600'
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#FF9800',
    fontWeight: '600',
    fontSize: 12,
  },
  classInfo: {
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: '600',
    width: 60,
    color: '#555',
  },
  value: {
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  btnReject: {
    backgroundColor: '#FFEBEE',
  },
  btnApprove: {
    backgroundColor: '#E8F5E9',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 14,
  }
});
