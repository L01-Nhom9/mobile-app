import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock Data
const MOCK_REQUESTS = [
  { _id: '1', className: 'Phát triển ứng dụng thiết bị di động', code: 'CO3007', date: '22/11/2025', reason: 'Bị sốt, xin phép nghỉ buổi học', status: 'pending' },
  { _id: '2', className: 'Phát triển ứng dụng thiết bị di động', code: 'CO3007', date: '22/11/2025', reason: 'Bị sốt, xin phép nghỉ buổi học', status: 'approved' },
  { _id: '3', className: 'Quản lý dự án', code: 'CO3005', date: '20/11/2025', reason: 'Chuyện gia đình', status: 'rejected' },
  { _id: '4', className: 'Đánh giá hiệu năng', code: 'CO3001', date: '15/11/2025', reason: 'Xe hỏng', status: 'pending' },
];

const FILTERS = [
    { id: 'approved', label: 'Đã duyệt', color: '#4285F4' }, // Google Blue approx
    { id: 'pending', label: 'Chờ duyệt', color: '#8AB4F8' }, // Lighter blue
    { id: 'rejected', label: 'Từ chối', color: '#D1E3FD' }, // Very light blue as per image logic maybe? Or use distinct colors. 
    // Image uses: Blue for Approved/Active filter? 
    // Actually in image: 
    // Filter buttons: "Đã duyệt" (Dark Blue), "Chờ duyệt" (Light Blue), "Từ chối" (Light Blue)
    // Badge colors: 
    // Pending: Purple Outline, Purple Text
    // Approved: Green Outline, Green Text
];

export default function RequestListScreen({ navigation, user, onLogout }) {
  const [activeFilter, setActiveFilter] = useState('approved');
  
  // Filter Logic (Mock)
  // ... (keeping existing logic implicitly, but since we are modifying the function signature and header, we act on the file)
  
  const filteredRequests = activeFilter === 'all' 
    ? MOCK_REQUESTS 
    : MOCK_REQUESTS.filter(req => req.status === activeFilter);

  const getStatusColor = (status) => {
      switch(status) {
          case 'pending': return { color: '#C084FC', borderColor: '#C084FC', bg: '#F3E8FF' }; // Purple
          case 'approved': return { color: '#4ADE80', borderColor: '#4ADE80', bg: '#DCFCE7' }; // Green
          case 'rejected': return { color: '#F87171', borderColor: '#F87171', bg: '#FEE2E2' }; // Red
          default: return { color: '#999', borderColor: '#999', bg: '#eee' };
      }
  };

  const getStatusText = (status) => {
      switch(status) {
          case 'pending': return 'CHỜ DUYỆT';
          case 'approved': return 'ĐÃ DUYỆT';
          case 'rejected': return 'TỪ CHỐI';
          default: return status;
      }
  };

  const renderItem = ({ item }) => {
      const style = getStatusColor(item.status);
      return (
        <View style={styles.card}>
            <Text style={styles.className}>{item.className}</Text>
            <Text style={styles.classCode}>{item.code}</Text>
            <View style={styles.divider} />
            
            <Text style={styles.infoLine}><Text style={styles.label}>Ngày:</Text> {item.date}</Text>
            <Text style={styles.infoLine}><Text style={styles.label}>Lý do:</Text> {item.reason}</Text>
            <Text style={[styles.infoLine, { textDecorationLine: 'underline', color: '#666' }]}>
                Minh chứng: Chi tiết
            </Text>

            <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { borderColor: style.borderColor, backgroundColor: style.bg }]}>
                    <Text style={[styles.statusText, { color: style.borderColor }]}>{getStatusText(item.status)}</Text>
                </View>
            </View>
        </View>
      );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onLogout}>
             <Ionicons name="log-out-outline" size={24} color="#202244" />
        </TouchableOpacity>
        {/* Title removed from center in design, big title below */}
      </View>

      <Text style={styles.userInfo}>NGUYỄN ĐỨC TRUNG KIÊN - 2311734</Text>
      <Text style={styles.screenTitle}>DANH SÁCH ĐƠN</Text>

      <View style={styles.statsRow}>
          <Ionicons name="document-text-outline" size={20} color="#333" />
          <Text style={styles.statsText}>{MOCK_REQUESTS.length} Đơn</Text>
      </View>

      <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Bộ lọc:</Text>
          {FILTERS.map(f => (
              <TouchableOpacity 
                key={f.id} 
                style={[
                    styles.filterChip, 
                    activeFilter === f.id ? { backgroundColor: '#4285F4' } : { backgroundColor: '#E8F0FE' }
                ]}
                onPress={() => setActiveFilter(f.id === activeFilter ? 'all' : f.id)}
              >
                  <Text style={[
                      styles.filterText,
                      activeFilter === f.id ? { color: 'white' } : { color: '#4285F4' }
                  ]}>{f.label}</Text>
              </TouchableOpacity>
          ))}
      </View>

      <FlatList
        data={activeFilter === 'all' ? MOCK_REQUESTS : filteredRequests}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    alignItems: 'flex-start',
  },
  userInfo: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
      fontFamily: 'Roboto',
      marginBottom: 5,
  },
  screenTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#202244',
      fontFamily: 'Roboto',
      marginBottom: 20,
  },
  statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  statsText: {
      marginLeft: 5,
      fontWeight: 'bold',
      color: '#333',
      fontFamily: 'Roboto',
  },
  filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
  },
  filterLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 10,
      fontFamily: 'Roboto',
  },
  filterChip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 15,
      marginRight: 10,
  },
  filterText: {
      fontSize: 12,
      fontWeight: 'bold',
      fontFamily: 'Roboto',
  },
  listContent: {
      paddingBottom: 20,
  },
  card: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#eee',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
  },
  className: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      fontFamily: 'Roboto',
  },
  classCode: {
      fontSize: 14,
      color: '#999',
      marginBottom: 10,
      fontFamily: 'Roboto',
  },
  divider: {
      height: 1,
      backgroundColor: '#f0f0f0',
      marginBottom: 10,
  },
  infoLine: {
      fontSize: 14,
      color: '#333',
      marginBottom: 5,
      fontFamily: 'Roboto',
  },
  label: {
      color: '#999',
  },
  statusContainer: {
      alignItems: 'center',
      marginTop: 10,
  },
  statusBadge: {
      paddingVertical: 5,
      paddingHorizontal: 20,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: 'transparent', // Default overridden
  },
  statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      fontFamily: 'Roboto',
      textTransform: 'uppercase',
  }
});
