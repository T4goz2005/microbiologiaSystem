import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importe apenas as telas necessárias
import Home from '../pages/Home';
import PacientesScreen from '../pages/Pacientes';
// Removido: ModelosScreen

const Tab = createBottomTabNavigator();

export default function AppTabs({ navigation, route }) {
    const { onLogout } = route.params || {}; 

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#2E86FF',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { paddingBottom: 5, height: 60 },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'HomeTab') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'PacientesTab') {
                        iconName = focused ? 'people' : 'people-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen 
                name="HomeTab" 
                options={{ title: 'Início' }}
            >
                {props => <Home {...props} onLogout={onLogout} />}
            </Tab.Screen>

            <Tab.Screen 
                name="PacientesTab" 
                component={PacientesScreen} 
                options={{ title: 'Pacientes' }}
            />
            
            {/* Aba Modelos REMOVIDA */}
        </Tab.Navigator>
    );
}