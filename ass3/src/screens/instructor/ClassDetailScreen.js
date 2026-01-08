import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import InstructorRequestCard from '../../components/InstructorRequestCard';
import ProofModal from '../../components/ProofModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { classroomService } from '../../services/classroomService';

import { useFocusEffect } from '@react-navigation/native';

// Mock Data
const MOCK_REQUESTS = [
    { _id: '1', studentName: 'Nguyễn Văn A', studentId: '2211832', date: '22/11/2025', reason: 'Bị sốt, xin phép nghỉ buổi học', status: 'pending', proofImage: 'https://via.placeholder.com/300' },
    { _id: '2', studentName: 'Lê Thị B', studentId: '2211999', date: '21/11/2025', reason: 'Nhà có việc bận', status: 'approved', proofImage: '' },
    { _id: '3', studentName: 'Trần C', studentId: '2211000', date: '20/11/2025', reason: 'Xe hư', status: 'rejected', proofImage: 'https://via.placeholder.com/300' },
];

import { requestService } from '../../services/requestService';

export default function ClassDetailScreen({ route, navigation }) {
    const { classData } = route.params || { classData: { name: 'Quản lý dự án', code: 'CO3007' } }; 
    const [activeFilter, setActiveFilter] = useState('pending');

    // Request List State
    const [allRequests, setAllRequests] = useState([]);
    const [displayedRequests, setDisplayedRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    // Student List State
    const [studentModalVisible, setStudentModalVisible] = useState(false);
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Report State
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [downloadingReport, setDownloadingReport] = useState(false);

    const handleDownloadReport = async () => {
        setDownloadingReport(true);
        try {
            // Format dates as YYYY-MM-DD
            const formatDate = (d) => d.toISOString().split('T')[0];
            const fromStr = formatDate(fromDate);
            const toStr = formatDate(toDate);

            // Fetch CSV data
            const csvData = await classroomService.getAttendanceReport(classData._id, fromStr, toStr);

            // Path to save file
            const fileName = `Attendance_Report_${classData.code}_${fromStr}_${toStr}.csv`;
            const fileUri = FileSystem.documentDirectory + fileName;

            // Write to file
            await FileSystem.writeAsStringAsync(fileUri, csvData, {
                encoding: 'utf8',
            });

            // Share/Open file
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert("Lỗi", "Thiết bị không hỗ trợ chia sẻ file.");
            }
            
            setReportModalVisible(false);

        } catch (error) {
            console.log("Download error:", error);
            let errorMessage = "Không thể tải báo cáo.";
            
            if (error.response) {
                errorMessage += `\nStatus: ${error.response.status}`;
                errorMessage += `\nData: ${JSON.stringify(error.response.data)}`;
            } else if (error.message) {
                 errorMessage += `\nLỗi: ${error.message}`;
            }

            Alert.alert("Chi tiết lỗi", errorMessage);
        } finally {
            setDownloadingReport(false);
        }
    };

    const onFromDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || fromDate;
        setShowFromPicker(Platform.OS === 'ios');
        setFromDate(currentDate);
    };

    const onToDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || toDate;
        setShowToPicker(Platform.OS === 'ios');
        setToDate(currentDate);
    };

    const handleViewStudents = async () => {
        setStudentModalVisible(true);
        setLoadingStudents(true);
        try {
            const data = await classroomService.getClassStudents(classData._id); 
            setStudents(data);
        } catch (error) {
            console.log('Error fetching students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };


    const handleCopyCode = async () => {
        await Clipboard.setStringAsync(classData.code);
        Alert.alert("Thành công", `Đã sao chép mã lớp: ${classData.code}`);
    };

    const fetchRequests = async () => {
        setLoadingRequests(true);
        console.log("Fetching requests for class:", classData._id);
        try {
            const data = await requestService.getRequestsByClass(classData._id);
            console.log("Fetched Data:", JSON.stringify(data, null, 2));
            
            // Map data
            const mapped = data.map(r => ({
                _id: r.id,
                studentName: r.studentName,
                studentId: '', 
                date: r.absenceDate,
                reason: r.reason,
                status: r.status ? r.status.toLowerCase() : 'pending',
                proofImage: r.id, 
            }));
            
            setAllRequests(mapped);
        } catch (error) {
            console.log('Error fetching requests:', error);
            setAllRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchRequests();
        }, [classData._id])
    );

    // Filter effect
    useEffect(() => {
        const filtered = allRequests.filter(r => r.status === activeFilter);
        console.log(`Filtering for ${activeFilter}: found ${filtered.length} items`);
        setDisplayedRequests(filtered);
    }, [activeFilter, allRequests]);

    useEffect(() => {
        const getToken = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            setAccessToken(token);
        };
        getToken();
    }, []);


    const handleApprove = async (id) => {
        try {
            await requestService.approveRequest(id);
            fetchRequests(); // Refresh
        } catch (error) {
            console.log("Error approving:", error);
            alert("Có lỗi xảy ra khi duyệt đơn");
        }
    };

    const handleReject = async (id) => {
         try {
             const request = allRequests.find(r => r._id === id);
             const denialReason = request ? request.reason : "Không có lý do cụ thể";
             
             console.log("Rejecting with reason:", denialReason);
             await requestService.rejectRequest(id, denialReason);
             fetchRequests(); // Refresh
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

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.className}>{classData.name}</Text>

            <View style={styles.codeContainer}>
                <Text style={styles.classCodeLabel}>Mã lớp: </Text>
                <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
                    <Text style={styles.classCode}>{classData.code}</Text>
                    <Ionicons name="copy-outline" size={18} color="#4285F4" style={{ marginLeft: 5 }} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <TouchableOpacity onPress={handleViewStudents}>
                    <Text style={[styles.statsText, { textDecorationLine: 'underline', color: '#4285F4' }]}>
                        <Ionicons name="people" size={16} /> Xem danh sách sinh viên
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setReportModalVisible(true)} style={styles.reportBtn}>
                    <Ionicons name="download-outline" size={16} color="#202244" />
                    <Text style={styles.reportBtnText}>Xuất báo cáo</Text>
                </TouchableOpacity>
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
            {loadingRequests ? (
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
            {/* Student List Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={studentModalVisible}
                onRequestClose={() => setStudentModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Danh sách sinh viên</Text>
                            <TouchableOpacity onPress={() => setStudentModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        {loadingStudents ? (
                            <Text style={styles.loadingText}>Đang tải...</Text>
                        ) : (
                            <FlatList
                                data={students}
                                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.studentItem}>
                                        <View style={styles.studentAvatar}>
                                            <Text style={styles.avatarText}>{item.fullName?.charAt(0) || '?'}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.studentName}>{item.fullName}</Text>
                                            <Text style={styles.studentEmail}>{item.email}</Text>
                                        </View>
                                    </View>
                                )}
                                ListEmptyComponent={<Text style={styles.emptyText}>Chưa có sinh viên nào.</Text>}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Report Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={reportModalVisible}
                onRequestClose={() => setReportModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Xuất báo cáo điểm danh</Text>
                            <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.datePickerContainer}>
                            <Text style={styles.label}>Từ ngày:</Text>
                            <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
                                <Text>{fromDate.toLocaleDateString('vi-VN')}</Text>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                            </TouchableOpacity>
                            {showFromPicker && (
                                <DateTimePicker
                                    value={fromDate}
                                    mode="date"
                                    display="default"
                                    onChange={onFromDateChange}
                                />
                            )}
                        </View>

                        <View style={styles.datePickerContainer}>
                            <Text style={styles.label}>Đến ngày:</Text>
                            <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
                                <Text>{toDate.toLocaleDateString('vi-VN')}</Text>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                            </TouchableOpacity>
                            {showToPicker && (
                                <DateTimePicker
                                    value={toDate}
                                    mode="date"
                                    display="default"
                                    onChange={onToDateChange}
                                />
                            )}
                        </View>

                        {downloadingReport ? (
                             <ActivityIndicator size="large" color="#4285F4" style={{ marginTop: 20 }} />
                        ) : (
                            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadReport}>
                                <Text style={styles.downloadBtnText}>Tải xuống (.csv)</Text>
                            </TouchableOpacity>
                        )}
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
        color: '#4285F4',
    },
    className: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#202244',
        marginBottom: 5,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    classCodeLabel: {
        fontSize: 16,
        color: '#666',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F5FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D0DFFF',
    },
    statsRow: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        maxHeight: '80%',
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
        color: '#202244',
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    studentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F0FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#4285F4',
        fontWeight: 'bold',
        fontSize: 18,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    studentEmail: {
        fontSize: 14,
        color: '#666',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
    },
    // Report Modal Styles
    reportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F0FE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 5
    },
    reportBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#202244',
    },
    datePickerContainer: {
        marginBottom: 15,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#555',
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
    },
    downloadBtn: {
        backgroundColor: '#4285F4',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    downloadBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
