import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Filter from '../../components/Filter';
import FormList from '../../components/FormList';
import { requestService } from '../../services/requestService';
import ProofModal from '../../components/ProofModal';
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

    // Proof Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [proofImage, setProofImage] = useState(null);
    const [loadingProof, setLoadingProof] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await requestService.getMyRequests();
            // Map API data to UI format
            // API: { id, classroomName, absenceDate, status, reason, studentName, ... }
            const mappedData = data.map(item => ({
                _id: typeof item.id === 'number' ? item.id.toString() : item.id,
                className: item.classroomName,
                code: item.classroomId, // Using classroomId as code/ID
                date: item.absenceDate,
                reason: item.reason || 'No reason provided',
                status: item.status, // UPPERCASE from API
                studentName: item.studentName, // Added studentName
                // Don't map proofImage URL directly as we fetch it on demand
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

    const handlePressProof = async (item) => {
        setSelectedRequest(item);
        setModalVisible(true);
        // We use the image URL directly with headers now
    };

    const handleWithdraw = (requestId) => {
        Alert.alert(
            'Thu hồi yêu cầu',
            'Bạn có chắc chắn muốn thu hồi (xóa) yêu cầu này không?',
            [
                { text: 'Hủy', style: 'cancel' },
                { 
                    text: 'Đồng ý', 
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true); // Show loading/spinner locally if needed, or refresh list
                        try {
                            await requestService.deleteRequest(requestId);
                            // Refresh list
                            fetchRequests();
                            Alert.alert('Thành công', 'Đã thu hồi yêu cầu.');
                        } catch (error) {
                            console.error('Withdraw error:', error);
                            Alert.alert('Lỗi', 'Không thể thu hồi yêu cầu này.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#202244" />
                </TouchableOpacity>
            </View>

            {/* Use studentName from the first request if available, otherwise user.name */}
            <Text style={styles.userInfo}>{requests[0]?.studentName || user?.name || 'Student Name'}</Text>
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
                <FormList 
                    data={filteredRequests} 
                    onPressProof={handlePressProof}
                    onWithdraw={handleWithdraw}
                />
            )}

            {/* Proof Modal */}
            {selectedRequest && (
                <ProofModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    requestId={selectedRequest._id}
                    accessToken={user?.accessToken}
                    studentName={selectedRequest.studentName}
                    date={selectedRequest.date}
                    reason={selectedRequest.reason}
                    status={selectedRequest.status}
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
