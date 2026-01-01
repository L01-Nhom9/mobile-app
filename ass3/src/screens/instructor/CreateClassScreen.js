import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/Button';

export default function CreateClassScreen({ navigation }) {
    const [className, setClassName] = useState('');
    const [classCode, setClassCode] = useState('');

    const handleCreate = () => {
        if (!className.trim() || !classCode.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        // Mock success
        Alert.alert('Thành công', `Đã tạo lớp ${className} (${classCode})`, [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
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
                placeholder="Ví dụ: Quản lý dự án"
                value={className}
                onChangeText={setClassName}
                placeholderTextColor="#999"
            />

            <Text style={styles.label}>Mã lớp học</Text>
            <TextInput
                style={styles.input}
                placeholder="Ví dụ: CO3007"
                value={classCode}
                onChangeText={setClassCode}
                placeholderTextColor="#999"
            />

            <GradientButton
                title="Tạo lớp"
                onPress={handleCreate}
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
