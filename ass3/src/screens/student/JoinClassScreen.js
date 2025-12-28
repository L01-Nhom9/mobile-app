import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function JoinClassScreen({ navigation }) {
  const [classId, setClassId] = useState('');

  const handleJoin = () => {
    if (!classId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ID lớp học');
      return;
    }
    
    // Mock success - in real app would call API
    Alert.alert('Thành công', `Đã gửi yêu cầu tham gia lớp ${classId}`, [
        { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.overlay}>
       <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Tham gia lớp học</Text>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                     <Ionicons name="close" size={20} color="#333" />
                 </TouchableOpacity>
            </View>

            <Text style={styles.label}>ID lớp học</Text>
            <TextInput
                style={styles.input}
                placeholder="ID"
                value={classId}
                onChangeText={setClassId}
                placeholderTextColor="#999"
            />

            <TouchableOpacity onPress={handleJoin} style={styles.submitContainer}>
                <LinearGradient
                    colors={['#A78BFA', '#F9A8D4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                >
                    <Text style={styles.submitButtonText}>Tham gia</Text>
                </LinearGradient>
            </TouchableOpacity>

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
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 25,
    width: '100%',
    alignItems: 'center',
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'center', // Center title, absolute close btn
      width: '100%',
      marginBottom: 20,
      position: 'relative',
  },
  title: {
      fontSize: 22,
      fontWeight: 'bold',
      fontFamily: 'Roboto',
      color: '#000',
  },
  closeBtn: {
      position: 'absolute',
      right: 0,
      backgroundColor: '#f0f0f0',
      borderRadius: 15,
      padding: 5,
  },
  label: {
      alignSelf: 'flex-start',
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
      width: '50%',
      borderRadius: 25,
      overflow: 'hidden',
  },
  submitButton: {
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
  },
  submitButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
      fontFamily: 'Roboto',
  }
});
