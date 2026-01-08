import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InstructorRequestCard from '../../components/InstructorRequestCard';
import ProofModal from '../../components/ProofModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestService } from '../../services/requestService';
import { useFocusEffect } from '@react-navigation/native';

export default function InstructorRequestListScreen({ navigation }) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    
    // Data State
    const [allRequests, setAllRequests] = useState([]);
    const [displayedRequests, setDisplayedRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            setAccessToken(token);
        };
        getToken();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await requestService.getAllRequests();
            // Map data
            const mapped = data.map(r => ({
                _id: r.id,
                studentName: r.studentName,
                studentId: '', 
                className: r.classroomName,
                date: r.absenceDate,
                reason: r.reason,
                status: r.status ? r.status.toLowerCase() : 'pending',
                proofImage: r.id, // ID for fetching proof
            }));
            setAllRequests(mapped);
        } catch (error) {
            console.log('Error fetching all requests:', error);
            setAllRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchRequests();
        }, [])
    );

    useEffect(() => {
        if (activeFilter === 'all') {
            setDisplayedRequests(allRequests);
        } else {
            setDisplayedRequests(allRequests.filter(r => r.status === activeFilter));
        }
    }, [activeFilter, allRequests]);

    const handleApprove = async (id) => {
        try {
            await requestService.approveRequest(id);
            alert("Đã duyệt đơn");
            fetchRequests();
        } catch (error) {
            console.log("Error approving:", error);
            alert("Có lỗi xảy ra khi duyệt");
        }
    };

    const handleReject = async (id) => {
         try {
             // Find request to get reason
             const request = allRequests.find(r => r._id === id);
             const denialReason = request ? request.reason : "Không có lý do cụ thể";
             
             await requestService.rejectRequest(id, denialReason);
             alert("Đã từ chối đơn");
             fetchRequests();
         } catch (error) {
             console.log("Error rejecting:", error);
             const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra";
             alert(`Không thể từ chối đơn: ${msg}`);
         }
    };

    const handleOpenProof = (item) => {
        setSelectedProof(item);
        setModalVisible(true);
    };

    const FilterChip = ({ label, value }) => (
        <TouchableOpacity
            style={[styles.chip, activeFilter === value && styles.chipActive]}
            onPress={() => setActiveFilter(value)}
        >
            <Text style={[styles.chipText, activeFilter === value && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Bộ lọc:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FilterChip label="Tất cả" value="all" />
                        <FilterChip label="Đã duyệt" value="approved" />
                        <FilterChip label="Chờ duyệt" value="pending" />
                        <FilterChip label="Từ chối" value="rejected" />
                    </ScrollView>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4285F4" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={displayedRequests}
                    keyExtractor={item => item._id?.toString()}
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
            )}

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
    header: {
        marginBottom: 15,
    },
    backBtn: {
        marginBottom: 15,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
