import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import StudentHomeScreen from './src/screens/student/StudentHomeScreen';
import RequestFormScreen from './src/screens/student/RequestFormScreen';
import InstructorHomeScreen from './src/screens/instructor/InstructorHomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Student Stack ---
function StudentTabs({ user, onLogout }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="StudentHome">
          {props => <StudentHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
      {/* Add 'MyRequests' tab here later */}
    </Tab.Navigator>
  );
}

// --- Instructor Stack ---
function InstructorTabs({ user, onLogout }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="InstructorHome">
          {props => <InstructorHomeScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
      {/* Add 'Classes' tab here later */}
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
             <Stack.Screen name="Onboarding" component={OnboardingScreen} />
             <Stack.Screen name="Login">
              {props => <LoginScreen {...props} onLogin={setUser} />}
            </Stack.Screen>
          </>
        ) : user.role === 'student' ? (
          // Student Stack
          <>
            <Stack.Screen name="StudentMain">
              {props => <StudentTabs {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
               <Stack.Screen name="RequestForm">
                  {props => <RequestFormScreen {...props} user={user} />}
               </Stack.Screen>
            </Stack.Group>
          </>
        ) : (
          // Instructor Stack
          <Stack.Screen name="InstructorMain">
              {props => <InstructorTabs {...props} user={user} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
