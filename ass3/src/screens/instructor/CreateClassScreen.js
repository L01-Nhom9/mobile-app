import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/Button';
import { classroomService } from '../../services/classroomService'; // ← Thêm import

export default function CreateClassScreen({ navigation }) {
    const [className, setClassName] = useState('');
    const [classCode, setClassCode] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!className.trim() || !classCode.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên lớp và mã lớp');
            return;
        }

        setLoading(true);
        try {
            await classroomService.createClass(classCode.trim(), className.trim(), description.trim());
            Alert.alert('Thành công', 'Đã tạo lớp học mới!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            const msg = error.response?.data?.message || 'Đã có lỗi xảy ra';
            Alert.alert('Thất bại', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Tạo lớp mới</Text>
                <View style={{ width: 24 }} />
            </View>

            <Text style={styles.label}>Tên lớp học</Text>
            <TextInput
                style={styles.input}
                placeholder="Ví dụ: Phát triển ứng dụng di động"
                value={className}
                onChangeText={setClassName}
                placeholderTextColor="#999"
            />

            <Text style={styles.label}>Mã lớp học (ID)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ví dụ: CO3007"
                value={classCode}
                onChangeText={setClassCode}
                placeholderTextColor="#999"
                autoCapitalize="characters"
            />

            <Text style={styles.label}>Mô tả lớp học (không bắt buộc)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ví dụ: Lớp học phần Mobile 2025"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#999"
            />

            <GradientButton
                title={loading ? "Đang tạo..." : "Tạo lớp"}
                onPress={handleCreate}
                disabled={loading}
                style={styles.submitContainer}
            />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    backBtn: {
        padding: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        color: '#000',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
        fontFamily: 'Roboto',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        padding: 15,
        marginBottom: 25,
        fontSize: 16,
        fontFamily: 'Roboto',
    },
    submitContainer: {
        marginTop: 20,
    },
});
