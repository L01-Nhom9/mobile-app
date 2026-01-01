import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Filter from '../../components/Filter';
import FormList from '../../components/FormList';

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
    { id: 'rejected', label: 'Từ chối', color: '#D1E3FD' }, // Very light blue
];

export default function RequestListScreen({ navigation, user, onLogout }) {
    const [activeFilter, setActiveFilter] = useState('approved');

    const filteredRequests = activeFilter === 'all'
        ? MOCK_REQUESTS
        : MOCK_REQUESTS.filter(req => req.status === activeFilter);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#202244" />
                </TouchableOpacity>
            </View>

            <Text style={styles.userInfo}>NGUYỄN ĐỨC TRUNG KIÊN - 2311734</Text>
            <Text style={styles.screenTitle}>DANH SÁCH ĐƠN</Text>

            <View style={styles.statsRow}>
                <Ionicons name="document-text-outline" size={20} color="#333" />
                <Text style={styles.statsText}>{MOCK_REQUESTS.length} Đơn</Text>
            </View>

            <Filter
                options={FILTERS}
                activeFilter={activeFilter}
                onSelect={setActiveFilter}
            />

            <FormList data={activeFilter === 'all' ? MOCK_REQUESTS : filteredRequests} />
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
});
