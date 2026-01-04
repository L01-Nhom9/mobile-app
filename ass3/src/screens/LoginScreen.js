import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await authService.login(email, password);
      // response is the user object from authService: { email, role, accessToken, refreshToken }
      
      if (response && response.accessToken) {
          // Token is already stored in AsyncStorage by authService.login()
          onLogin(response); 
      } else {
           Alert.alert('Error', 'Login failed: No token received');
      }

    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
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
          <Text style={styles.title}>WELCOME TO CLASSTRACK</Text>
          
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

          <TouchableOpacity onPress={handleLogin} style={styles.buttonContainer}>
            <LinearGradient
              colors={['#A78BFA', '#F9A8D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }} // Left to right
              style={styles.button}
            >
              <Text style={styles.buttonText}>Đăng nhập</Text>
            </LinearGradient>
          </TouchableOpacity>

           <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
              <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký ngay</Text>
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
    borderRadius: 30, // More rounded as per visual cue (implied premium look)
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Slightly deeper shadow
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202244', // Specified color
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Roboto', // Requested font
    width: '100%',
  },
  input: {
    width: '100%',
    height: 55, // Slightly taller
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15, // More rounded
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto',
  },
  buttonContainer: {
    width: '60%', // Adjust width to match design often seen
    marginTop: 10,
    borderRadius: 25,
    overflow: 'hidden', // Ensure gradient respects border radius
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
  registerButton: {
      marginTop: 20,
  },
  registerText: {
      color: '#202244',
      fontSize: 14,
      textDecorationLine: 'underline',
      fontFamily: 'Roboto',
  }
});
