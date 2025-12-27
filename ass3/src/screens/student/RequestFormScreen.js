import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import mockApi from '../../services/mockApi'; // Adjusted path

export default function RequestFormScreen({ route, navigation, user }) {
  const { classroom } = route.params;
  const [reason, setReason] = useState('Bệnh/Ốm');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');

  const handleSubmit = async () => {
    try {
      await mockApi.requests.create({
        studentId: user._id,
        classroomId: classroom._id,
        reason,
        date,
        timeSlot
      });
      Alert.alert('Thành công', 'Đã gửi đơn xin nghỉ!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi đơn.');
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.modalTitle}>Đơn xin nghỉ học</Text>
          <Text style={styles.classCode}>{classroom.code}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Lý do xin nghỉ</Text>
          <TextInput style={styles.input} value={reason} onChangeText={setReason} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngày</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ca học (Giờ)</Text>
          <TextInput style={styles.input} value={timeSlot} onChangeText={setTimeSlot} placeholder="e.g. 7:00 - 9:50" />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Gửi đơn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#fff', // Changed from transparent overlay to full screen for simplicity if needed, but keeping modal feel is fine. 
    // Actually, if used as a screen in stack, white bg is better than transparent if not presentation: modal.
    // Let's keep it white for now as it's a "Form Screen"
    padding: 20,
    justifyContent: 'center'
  },
  modal: {
    backgroundColor: '#fff',
    // borderRadius: 20, // removed strict modal look
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  classCode: {
    color: '#888',
    marginTop: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  submitBtn: {
    backgroundColor: '#E6A8D7',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
