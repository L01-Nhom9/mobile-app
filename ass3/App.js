import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import JoinClassScreen from './src/screens/student/JoinClassScreen';
import StudentHomeScreen from './src/screens/student/StudentHomeScreen';
import RequestListScreen from './src/screens/student/RequestListScreen';
import RequestFormScreen from './src/screens/student/RequestFormScreen';
import InstructorHomeScreen from './src/screens/instructor/InstructorHomeScreen';
import CreateClassScreen from './src/screens/instructor/CreateClassScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ClassDetailScreen from './src/screens/instructor/ClassDetailScreen';
import InstructorRequestListScreen from './src/screens/instructor/InstructorRequestListScreen';

import { getTabScreenOptions } from './src/components/Footer';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Student Stack ---
import { Ionicons } from '@expo/vector-icons';

function StudentTabs({ user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={getTabScreenOptions('student')}
    >
      <Tab.Screen name="StudentHome" options={{ title: 'HOME' }}>
        {props => <StudentHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Add" component={View} options={{ title: '' }} listeners={{
        tabPress: (e) => {
          e.preventDefault(); // Placeholder action
        },
      }} />
      <Tab.Screen name="List" options={{ title: 'LIST' }}>
        {props => <RequestListScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// --- Instructor Stack ---
function InstructorTabs({ user, onLogout, navigation }) {
  return (
    <Tab.Navigator screenOptions={getTabScreenOptions('instructor')}>
      <Tab.Screen name="InstructorHome" options={{ title: 'HOME' }}>
        {props => <InstructorHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Add" component={View} options={{ title: '' }} listeners={({ navigation }) => ({
        tabPress: (e) => {
          e.preventDefault();
          navigation.navigate('InstructorHome', { openCreateModal: true });
        },
      })} />
      <Tab.Screen name="List" component={InstructorRequestListScreen} options={{ title: 'LIST' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value == null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  if (isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#93C5FD" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            {isFirstLaunch && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.role === 'student' ? (
          // Student Stack
          <>
            <Stack.Screen name="StudentMain">
              {props => <StudentTabs {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Group screenOptions={{ presentation: 'transparentModal', animation: 'fade' }}>
              <Stack.Screen name="RequestForm">
                {props => <RequestFormScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="JoinClass" component={JoinClassScreen} />
            </Stack.Group>
          </>
        ) : (
          // Instructor Stack
          <>
            <Stack.Screen name="InstructorMain">
              {props => <InstructorTabs {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="CreateClass" component={CreateClassScreen} />
            <Stack.Screen name="ClassDetail" component={ClassDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
