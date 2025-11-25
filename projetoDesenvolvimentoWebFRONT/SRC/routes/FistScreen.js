import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Telas
import LoginScreen from "../pages/login"; 
import AppTabs from "./AppTabs"; // Navegação por Abas (Home e Pacientes)
import RealizarExame from "../pages/RealizarExame"; // 🆕 Nova tela de exame fixo
import HistoricoAvaliacoes from "../pages/HistoricoAvaliacoes"; // Histórico

const Stack = createNativeStackNavigator();

// --- NAVEGADOR PRINCIPAL ---
const AppStack = ({ onLogout }) => ( 
    <Stack.Navigator>
        {/* 1. Tela Principal (Abas: Home e Pacientes) */}
        <Stack.Screen 
            name="MainTabs" 
            component={AppTabs} 
            options={{ headerShown: false }}
            initialParams={{ onLogout }} // Passa a função de logout para as abas
        />

        {/* 2. Telas Secundárias (Sem Abas) */}
        
        {/* Tela de Realizar Exame (Urina/Escarro) */}
        <Stack.Screen 
            name="RealizarExame" 
            component={RealizarExame} 
            options={{ title: 'Novo Exame' }} 
        />

        {/* Tela de Histórico */}
        <Stack.Screen 
            name="HistoricoAvaliacoesScreen" 
            component={HistoricoAvaliacoes} 
            options={{ title: 'Resultados dos Exames' }} 
        />
    </Stack.Navigator>
);

// --- NAVEGADOR DE LOGIN ---
const AuthStack = ({ onLoginSuccess }) => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
        </Stack.Screen>
    </Stack.Navigator>
);

// --- COMPONENTE RAIZ ---
export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    // Função de Logout
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
        } catch (e) {
            console.error("Erro ao fazer logout:", e);
        }
    };

    // Verifica se já tem token salvo ao abrir o app
    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
        } catch (e) {
            console.error("Erro token:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { checkToken(); }, []);

    const handleLoginSuccess = async () => {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token); 
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2E86FF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {userToken ? (
                // Passa a função handleLogout para o AppStack
                <AppStack onLogout={handleLogout} /> 
            ) : (
                <AuthStack onLoginSuccess={handleLoginSuccess} />
            )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
});