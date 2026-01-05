import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Filter from '../../components/Filter';
import FormList from '../../components/FormList';
import { requestService } from '../../services/requestService';
import { useFocusEffect } from '@react-navigation/native';

const FILTERS = [
    { id: 'all', label: 'Tất cả', color: '#6B7280' },
    { id: 'APPROVED', label: 'Đã duyệt', color: '#4ADE80' },
    { id: 'PENDING', label: 'Chờ duyệt', color: '#FCD34D' },
    { id: 'REJECTED', label: 'Từ chối', color: '#EF4444' },
];

export default function RequestListScreen({ navigation, user, onLogout }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await requestService.getMyRequests();
            // Map API data to UI format
            // API: { id, classroomName, absenceDate, status, reason, ... }
            const mappedData = data.map(item => ({
                _id: typeof item.id === 'number' ? item.id.toString() : item.id,
                className: item.classroomName,
                code: item.classroomId, // Using classroomId as code/ID
                date: item.absenceDate,
                reason: item.reason || 'No reason provided',
                status: item.status, // UPPERCASE from API
            }));
            
            // Sort by date descending (newest first)
            mappedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            setRequests(mappedData);
        } catch (error) {
            console.log('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRequests();
        }, [])
    );

    const filteredRequests = activeFilter === 'all'
        ? requests
        : requests.filter(req => req.status === activeFilter);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#202244" />
                </TouchableOpacity>
            </View>

            <Text style={styles.userInfo}>{user?.name || 'Student Name'}</Text>
            <Text style={styles.screenTitle}>DANH SÁCH ĐƠN</Text>

            <View style={styles.statsRow}>
                <Ionicons name="document-text-outline" size={20} color="#333" />
                <Text style={styles.statsText}>{requests.length} Đơn</Text>
            </View>

            <Filter
                options={FILTERS}
                activeFilter={activeFilter}
                onSelect={setActiveFilter}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#93C5FD" style={{ marginTop: 20 }} />
            ) : (
                <FormList data={filteredRequests} />
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
