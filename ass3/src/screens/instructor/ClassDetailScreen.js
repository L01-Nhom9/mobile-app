import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InstructorRequestCard from '../../components/InstructorRequestCard';
import ProofModal from '../../components/ProofModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Data
const MOCK_REQUESTS = [
    { _id: '1', studentName: 'Nguyễn Văn A', studentId: '2211832', date: '22/11/2025', reason: 'Bị sốt, xin phép nghỉ buổi học', status: 'pending', proofImage: 'https://via.placeholder.com/300' },
    { _id: '2', studentName: 'Lê Thị B', studentId: '2211999', date: '21/11/2025', reason: 'Nhà có việc bận', status: 'approved', proofImage: '' },
    { _id: '3', studentName: 'Trần C', studentId: '2211000', date: '20/11/2025', reason: 'Xe hư', status: 'rejected', proofImage: 'https://via.placeholder.com/300' },
];

export default function ClassDetailScreen({ route, navigation }) {
    const { classData } = route.params || { classData: { name: 'Quản lý dự án', code: 'CO3007' } }; 
    const [filter, setFilter] = useState('pending');

    const [activeFilter, setActiveFilter] = useState('pending');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            setAccessToken(token);
        };
        getToken();
    }, []);

    const getFilteredData = () => {
        return MOCK_REQUESTS.filter(r => r.status === activeFilter);
    };

    const handleApprove = (id) => {
        console.log('Approve', id);
    };

    const handleReject = (id) => {
        console.log('Reject', id);
    };

    const handleOpenProof = (item) => {
        setSelectedProof(item);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.classCode}>{classData.code}</Text>
            <Text style={styles.className}>{classData.name}</Text>

            <View style={styles.statsRow}>
                <Text style={styles.statsText}><Ionicons name="person-outline" /> 21 Sinh viên   |   10 Đơn</Text>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Bộ lọc:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.chip, activeFilter === 'approved' && styles.chipActive]}
                        onPress={() => setActiveFilter('approved')}
                    >
                        <Text style={[styles.chipText, activeFilter === 'approved' && styles.chipTextActive]}>Đã duyệt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, activeFilter === 'pending' && styles.chipActive]}
                        onPress={() => setActiveFilter('pending')}
                    >
                        <Text style={[styles.chipText, activeFilter === 'pending' && styles.chipTextActive]}>Chờ duyệt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, activeFilter === 'rejected' && styles.chipActive]}
                        onPress={() => setActiveFilter('rejected')}
                    >
                        <Text style={[styles.chipText, activeFilter === 'rejected' && styles.chipTextActive]}>Từ chối</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* List */}
            <FlatList
                data={getFilteredData()}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <InstructorRequestCard
                        item={item}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onPressProof={() => handleOpenProof(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Không có đơn nào.</Text>}
            />

            {/* Modal */}
            {selectedProof && (
                <ProofModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    requestId={selectedProof._id}
                    accessToken={accessToken}
                    studentName={selectedProof.studentName}
                    date={selectedProof.date}
                    reason={selectedProof.reason}
                    status={selectedProof.status}
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
    backBtn: {
        marginBottom: 10,
    },
    classCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    className: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#202244',
        marginBottom: 10,
    },
    statsRow: {
        marginBottom: 20,
    },
    statsText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    filterLabel: {
        fontWeight: 'bold',
        marginRight: 10,
        fontSize: 14,
    },
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#E8F0FE',
        marginRight: 10,
    },
    chipActive: {
        backgroundColor: '#4285F4',
    },
    chipText: {
        color: '#4285F4',
        fontWeight: '600',
        fontSize: 12,
    },
    chipTextActive: {
        color: 'white',
    },
    listContent: {
        paddingBottom: 20,
    }
});
