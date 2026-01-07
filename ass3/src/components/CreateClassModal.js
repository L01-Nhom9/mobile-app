import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from './Button';
import { classroomService } from '../services/classroomService';

export default function CreateClassModal({ visible, onClose, onSuccess }) {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!id.trim() || !name.trim() || !description.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            setLoading(true);
            await classroomService.createClass({ id, name, description });
            Alert.alert('Thành công', `Đã tạo lớp ${name}`);
            
            setId('');
            setName('');
            setDescription('');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.log('Create class error:', error);
            Alert.alert('Lỗi', 'Không thể tạo lớp học. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Tạo Lớp Học Mới</Text>

                    <Text style={styles.label}>Mã Lớp Học (ID)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="VD: L01"
                        value={id}
                        onChangeText={setId}
                        placeholderTextColor="#ccc"
                    />

                    <Text style={styles.label}>Tên Lớp Học</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="VD: Mobile Pro"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#ccc"
                    />

                    <Text style={styles.label}>Mô Tả</Text>
                     <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Mô tả lớp học..."
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#ccc"
                        multiline={true}
                        numberOfLines={3}
                    />

                    <View style={styles.buttonContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#4285F4" />
                        ) : (
                            <GradientButton
                                title="Tạo lớp mới"
                                onPress={handleCreate}
                                style={styles.createBtn}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
        zIndex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Roboto',
    },
    label: {
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
        marginTop: 10,
        fontFamily: 'Roboto',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        padding: 12,
        marginBottom: 10,
        color: '#333',
        fontFamily: 'Roboto',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    createBtn: {
        width: '60%',
    }
});
