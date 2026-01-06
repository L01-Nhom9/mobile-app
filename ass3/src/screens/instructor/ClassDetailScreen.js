import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Modal, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InstructorRequestCard from '../../components/InstructorRequestCard';
import ProofModal from '../../components/ProofModal';
import { classroomService } from '../../services/classroomService';
import { requestService } from '../../services/requestService';

export default function ClassDetailScreen({ route, navigation }) {
    const { classData } = route.params || { classData: { name: 'Quản lý dự án', code: 'CO3007', _id: '1' } };
    const classId = classData._id || classData.id; // Ensure we have ID

    const [activeFilter, setActiveFilter] = useState('pending');

    // Data States
    const [students, setStudents] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [studentModalVisible, setStudentModalVisible] = useState(false);
    const [proofModalVisible, setProofModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);

    const [selectedProof, setSelectedProof] = useState(null);
    const [selectedRequestToReject, setSelectedRequestToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchData();
    }, [classId, activeFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsData, requestsData] = await Promise.all([
                classroomService.getStudentsInClass(classId),
                requestService.getRequestsForClass(classId, { status: activeFilter === 'all' ? undefined : activeFilter })
            ]);
            setStudents(studentsData || []);
            setRequests(requestsData || []);
        } catch (error) {
            console.log('Error fetching class details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await requestService.approveRequest(id);
            Alert.alert('Thành công', 'Đã duyệt đơn xin nghỉ');
            fetchData();
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể duyệt đơn');
        }
    };

    const handleRejectInit = (id) => {
        setSelectedRequestToReject(id);
        setRejectionReason('');
        setRejectModalVisible(true);
    };

    const confirmReject = async () => {
        if (!rejectionReason.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
            return;
        }
        try {
            await requestService.denyRequest(selectedRequestToReject, rejectionReason);
            Alert.alert('Thành công', 'Đã từ chối đơn xin nghỉ');
            setRejectModalVisible(false);
            fetchData();
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể từ chối đơn');
        }
    };

    const handleOpenProof = async (item) => {
        try {
            const detail = await requestService.getLeaveRequestDetail(item.id || item._id);
            setSelectedProof(detail);
            setProofModalVisible(true);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải chi tiết đơn xin nghỉ');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.classCode}>{classData.code || classData.id}</Text>
            <Text style={styles.className}>{classData.name}</Text>

            <View style={styles.statsRow}>
                <TouchableOpacity onPress={() => setStudentModalVisible(true)}>
                    <Text style={styles.statsText}>
                        <Ionicons name="person-outline" size={16} /> {students.length} Sinh viên   |   {requests.length} Đơn
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Bộ lọc:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[styles.chip, activeFilter === 'pending' && styles.chipActive]}
                        onPress={() => setActiveFilter('pending')}
                    >
                        <Text style={[styles.chipText, activeFilter === 'pending' && styles.chipTextActive]}>Chờ duyệt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, activeFilter === 'approved' && styles.chipActive]}
                        onPress={() => setActiveFilter('approved')}
                    >
                        <Text style={[styles.chipText, activeFilter === 'approved' && styles.chipTextActive]}>Đã duyệt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, activeFilter === 'rejected' && styles.chipActive]}
                        onPress={() => setActiveFilter('rejected')}
                    >
                        <Text style={[styles.chipText, activeFilter === 'rejected' && styles.chipTextActive]}>Từ chối</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chip, activeFilter === 'all' && styles.chipActive]}
                        onPress={() => setActiveFilter('all')}
                    >
                        <Text style={[styles.chipText, activeFilter === 'all' && styles.chipTextActive]}>Tất cả</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* List */}
            {loading ? (
                <ActivityIndicator size="large" color="#4285F4" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={item => (item.id || item._id).toString()}
                    renderItem={({ item }) => (
                        <InstructorRequestCard
                            item={{
                                _id: item.id,
                                studentName: item.studentName || item.user?.fullName || 'Sinh viên',
                                studentId: item.studentId,
                                classId: classId,
                                date: item.absenceDate,
                                reason: item.reason,
                                status: item.status ? item.status.toLowerCase() : 'pending',
                                proofImage: item.evidenceFilePath
                            }}
                            onApprove={() => handleApprove(item.id)}
                            onReject={() => handleRejectInit(item.id)}
                            onPressProof={() => handleOpenProof(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Không có đơn nào.</Text>}
                />
            )}

            {/* Student List Modal - Re-added as requested */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={studentModalVisible}
                onRequestClose={() => setStudentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.studentListContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Danh sách sinh viên</Text>
                            <TouchableOpacity onPress={() => setStudentModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={students}
                            keyExtractor={(item) => (item.id || item.email).toString()}
                            renderItem={({ item }) => (
                                <View style={styles.studentItem}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{(item.fullName || item.email || '?')[0].toUpperCase()}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.studentName}>{item.fullName}</Text>
                                        <Text style={styles.studentEmail}>{item.email}</Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Chưa có sinh viên nào.</Text>}
                        />
                    </View>
                </View>
            </Modal>

            {/* Proof Modal */}
            {selectedProof && (
                <ProofModal
                    visible={proofModalVisible}
                    onClose={() => setProofModalVisible(false)}
                    imageUrl={selectedProof.evidenceFilePath}
                    studentName={selectedProof.studentName || selectedProof.user?.fullName}
                    date={selectedProof.absenceDate}
                    reason={selectedProof.reason}
                    status={selectedProof.status}
                />
            )}

            {/* Reject Reason Modal - Re-added for functional buttons */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={rejectModalVisible}
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Từ chối đơn</Text>
                            <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ marginBottom: 10 }}>Lý do từ chối:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lý do..."
                            multiline
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setRejectModalVisible(false)}
                            >
                                <Text style={styles.btnText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.confirmBtn]}
                                onPress={confirmReject}
                            >
                                <Text style={[styles.btnText, styles.confirmBtnText]}>Từ chối</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    studentListContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F0FE',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#4285F4',
        fontWeight: 'bold',
        fontSize: 16,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    studentEmail: {
        fontSize: 12,
        color: '#999',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginLeft: 10,
    },
    cancelBtn: {
        backgroundColor: '#f5f5f5',
    },
    confirmBtn: {
        backgroundColor: '#4285F4',
    },
    btnText: {
        fontWeight: 'bold',
        color: '#333',
    },
    confirmBtnText: {
        color: 'white',
    },
});
