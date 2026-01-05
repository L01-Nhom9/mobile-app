import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Image, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import GradientButton from '../../components/Button';
import { requestService } from '../../services/requestService';

const REASONS = ['Đau ốm', 'Chuyện gia đình', 'Phương tiện di chuyển', 'Khác'];

export default function RequestFormScreen({ route, navigation, user }) {
    const { classroom } = route.params;
    const [reason, setReason] = useState(null);
    const [absenceDate, setAbsenceDate] = useState(new Date());
    const [proofImage, setProofImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dropdown States
    const [showReasonPicker, setShowReasonPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handlePickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProofImage(result.assets[0].uri);
        }
    };

    const handleLaunchCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission to access camera is required!");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProofImage(result.assets[0].uri);
        }
    }

    const showImageOptions = () => {
        Alert.alert(
            "Chọn minh chứng",
            "Chọn ảnh từ thư viện hoặc chụp ảnh mới",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Thư viện", onPress: handlePickImage },
                { text: "Máy ảnh", onPress: handleLaunchCamera }
            ]
        );
    }

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || absenceDate;
        setShowDatePicker(Platform.OS === 'ios');
        setAbsenceDate(currentDate);
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    const handleSubmit = async () => {
        if (!reason) {
            Alert.alert('Thiếu thông tin', 'Vui lòng chọn lý do.');
            return;
        }

        // Validate date (must be in future? User said "future")
        // Just checking it's not today or past? Or just allow any date user picks if they really need to.
        // Prompt said "chọn một ngày trong tương lai". I'll warn if it's past but let's assume the picker minDate handles basic constraint if we wanted.
        // For now, I'll trust the user input or add a simple check.
        const today = new Date();
        today.setHours(0,0,0,0);
        if (absenceDate < today) {
             Alert.alert('Ngày không hợp lệ', 'Vui lòng chọn ngày trong tương lai (hoặc hôm nay).');
             return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('classroomId', classroom._id);
            formData.append('absenceDate', formatDate(absenceDate));
            formData.append('reason', reason);
            
            if (proofImage) {
                // Get filename
                const filename = proofImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('evidence', {
                    uri: proofImage,
                    name: filename,
                    type: type,
                });
            }

            await requestService.submitLeaveRequest(formData);

            Alert.alert('Thành công', 'Đã gửi đơn xin nghỉ!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Submit Error:', error);
            let msg = 'Không thể gửi đơn. Vui lòng thử lại.';
            if (error.response) {
                msg += `\nStatus: ${error.response.status}`;
                if (error.response.data) {
                    msg += `\nData: ${JSON.stringify(error.response.data)}`;
                }
            } else {
                msg += `\nError: ${error.message}`;
            }
            Alert.alert('Lỗi', msg);
        } finally {
            setLoading(false);
        }
    };

    const RenderDropdown = ({ visible, options, onSelect, onClose }) => {
        return (
            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
                    <View style={styles.dropdownContainer}>
                        {options.map((opt, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.dropdownItem}
                                onPress={() => { onSelect(opt); onClose(); }}
                            >
                                <Text style={styles.dropdownText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ width: 24 }} />
                    <Text style={styles.title}>Đơn xin nghỉ học</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <Ionicons name="close" size={20} color="#333" />
                    </TouchableOpacity>
                </View>
                <View style={styles.subHeader}>
                    <Text style={styles.className}>{classroom.name}</Text>
                    <Text style={styles.classCode}>{classroom.code}</Text>
                </View>

                {/* Inputs */}
                <View style={styles.row}>
                    <TouchableOpacity style={styles.picker} onPress={() => setShowReasonPicker(true)}>
                        <Text style={[styles.pickerText, !reason && styles.placeholder]}>
                            {reason || 'Lý do xin nghỉ'}
                        </Text>
                        <Ionicons name="caret-down" size={16} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.picker} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.pickerText}>
                            {formatDate(absenceDate)}
                        </Text>
                        <Feather name="calendar" size={16} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={absenceDate}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()} // Ensure future/today
                    />
                )}

                {/* Dropdowns */}
                <RenderDropdown
                    visible={showReasonPicker}
                    options={REASONS}
                    onSelect={setReason}
                    onClose={() => setShowReasonPicker(false)}
                />

                {/* Proof Area */}
                <TouchableOpacity style={styles.proofArea} onPress={showImageOptions}>
                    {proofImage ? (
                        <Image source={{ uri: proofImage }} style={styles.proofImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.proofPlaceholder}>
                            <Text style={styles.proofText}>Minh chứng</Text>
                            <Ionicons name="camera-outline" size={24} color="#666" />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Submit Button */}
                {loading ? (
                    <ActivityIndicator size="large" color="#93C5FD" />
                ) : (
                    <GradientButton
                        title="Nộp đơn"
                        onPress={handleSubmit}
                        style={styles.submitContainer}
                    />
                )}

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 25,
        paddingTop: 30,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        marginBottom: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        color: '#000',
    },
    closeBtn: {
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        padding: 5,
    },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        justifyContent: 'center'
    },
    className: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000',
        marginRight: 10,
        fontFamily: 'Roboto',
    },
    classCode: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'Roboto',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    picker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20, // Rounded pill shape
        paddingHorizontal: 15,
        paddingVertical: 12,
        width: '48%',
    },
    pickerText: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'Roboto',
    },
    placeholder: {
        color: '#999',
    },
    proofArea: {
        width: '100%',
        height: 150,
        borderWidth: 1,
        borderColor: '#ddd', 
        borderRadius: 20,
        marginBottom: 25,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    proofPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proofText: {
        color: '#999',
        marginRight: 10,
        fontFamily: 'Roboto',
    },
    proofImage: {
        width: '100%',
        height: '100%',
    },
    submitContainer: {
        width: '60%',
    },
    // Modal Dropdown Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownContainer: {
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 15,
        padding: 10,
        elevation: 5,
    },
    dropdownItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Roboto',
    }
});

