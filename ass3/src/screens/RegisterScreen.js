import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import mockApi from '../services/mockApi';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = async () => {
    if (!username || !password || !email) {
       Alert.alert('Error', 'Please fill all fields');
       return;
    }
    if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
    }

    try {
      // In a real app, this would call an API
      // await mockApi.auth.register({ username, password, email });
      Alert.alert('Success', 'Registration successful!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      console.log('Register error:', error);
      Alert.alert('Error', 'Registration failed');
    }
  };

  return (
    <LinearGradient
      colors={['#F9A8D4', '#93C5FD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>REGISTER</Text>
          
           <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
           <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
             keyboardType="email-address"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
           <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity onPress={handleRegister} style={styles.buttonContainer}>
            <LinearGradient
              colors={['#A78BFA', '#F9A8D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }} 
              style={styles.button}
            >
              <Text style={styles.buttonText}>Đăng ký</Text>
            </LinearGradient>
          </TouchableOpacity>

           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLinkButton}>
              <Text style={styles.loginLinkText}>Đã có tài khoản? Đăng nhập</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 30, 
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202244',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Roboto',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 55, 
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15, 
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto',
  },
  buttonContainer: {
    width: '60%', 
    marginTop: 10,
    borderRadius: 25,
    overflow: 'hidden', 
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Roboto',
  },
   loginLinkButton: {
      marginTop: 20,
  },
  loginLinkText: {
      color: '#202244',
      fontSize: 14,
      textDecorationLine: 'underline',
      fontFamily: 'Roboto',
  }
});
